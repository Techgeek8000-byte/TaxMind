// ============================================================
// AI Utility Module — 4-Provider Cascade (HF → Gemini → Grok → OpenAI)
// ============================================================

// ── Types ─────────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ContentPart[]
}

interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

interface AIResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
  provider?: string
}

export interface TaxDocumentExtraction {
  documentType: string | null
  taxYear: string | null
  ntn: string | null
  cnic: string | null
  employerName: string | null
  grossSalary: number | null
  basicSalary: number | null
  allowances: number | null
  taxDeducted: number | null
  otherIncome: number | null
  businessIncome: number | null
  propertyIncome: number | null
  capitalGains: number | null
  deductions: Record<string, number> | null
  exemptions: string[] | null
  bankName: string | null
  accountTitle: string | null
  summary: string
  rawText: string | null
  confidence: number
  provider?: string
}

// ── Provider Config ────────────────────────────────────────────

const PROVIDERS = [
  {
    name: 'huggingface' as const,
    envKey: 'HF_API_KEY',
    url: 'https://router.huggingface.co/v1/chat/completions',
    model: 'Qwen/Qwen2.5-VL-7B-Instruct',
    format: 'openai' as const,
  },
  {
    name: 'gemini' as const,
    envKey: 'GEMINI_API_KEY',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash',
    format: 'gemini' as const,
  },
  {
    name: 'grok' as const,
    envKey: 'XAI_API_KEY',
    url: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-3-mini',
    format: 'openai' as const,
  },
  {
    name: 'openai' as const,
    envKey: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    format: 'openai' as const,
  },
]

function getProviderConfig(name: string) {
  return PROVIDERS.find((p) => p.name === name)
}

// ── Helpers ────────────────────────────────────────────────────

/** Convert OpenAI-style messages to Gemini contents/parts format. */
function toGeminiContents(messages: ChatMessage[]) {
  const systemMsg = messages.find((m) => m.role === 'system')
  const nonSystem = messages.filter((m) => m.role !== 'system')

  const contents = nonSystem.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      },
    ],
  }))

  // Gemini uses a top-level systemInstruction for system messages
  const systemInstruction = systemMsg
    ? {
        parts: [
          {
            text:
              typeof systemMsg.content === 'string'
                ? systemMsg.content
                : JSON.stringify(systemMsg.content),
          },
        ],
      }
    : undefined

  return { systemInstruction, contents }
}

/** Extract the text content from an OpenAI-compatible response. */
function extractOpenAIContent(json: Record<string, unknown>): string | null {
  return (json.choices as Array<{ message?: { content?: string } }>)?.[0]?.message?.content ?? null
}

/** Extract the text content from a Gemini response. */
function extractGeminiContent(json: Record<string, unknown>): string | null {
  return (
    (json.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }>)?.[0]?.content
      ?.parts?.[0]?.text ?? null
  )
}

/** Extract text from a response based on provider format. */
function extractContent(
  json: Record<string, unknown>,
  format: 'openai' | 'gemini'
): string | null {
  return format === 'gemini' ? extractGeminiContent(json) : extractOpenAIContent(json)
}

/** Check that at least one provider has an API key configured. */
function hasAnyKey(): boolean {
  return PROVIDERS.some(
    (p) => process.env[p.envKey] || (p.envKey === 'HF_API_KEY' && process.env.HUGGING_FACE_API_KEY)
  )
}

/** Get the API key for a given provider. */
function getKey(envKey: string): string | undefined {
  if (envKey === 'HF_API_KEY') {
    return process.env.HF_API_KEY || process.env.HUGGING_FACE_API_KEY
  }
  return process.env[envKey]
}

const NO_KEY_MESSAGE =
  'No AI API key configured. Please set at least one of the following environment variables to enable AI features: HF_API_KEY (free — get yours at https://huggingface.co/settings/tokens), GEMINI_API_KEY, XAI_API_KEY, or OPENAI_API_KEY. We recommend starting with HF_API_KEY as it is free.'

// ── Provider-Specific Call Functions (Chat) ───────────────────

async function callOpenAIChat(
  provider: (typeof PROVIDERS)[number],
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  const apiKey = getKey(provider.envKey)
  if (!apiKey) return { success: false, error: `No ${provider.envKey}` }

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const content = extractOpenAIContent(json)
  if (!content) throw new Error('No content in response')

  return { success: true, data: { raw: content }, provider: provider.name }
}

async function callGeminiChat(
  provider: (typeof PROVIDERS)[number],
  messages: ChatMessage[],
  temperature: number,
  _maxTokens: number
): Promise<AIResponse> {
  const apiKey = getKey(provider.envKey)
  if (!apiKey) return { success: false, error: `No ${provider.envKey}` }

  const { systemInstruction, contents } = toGeminiContents(messages)

  const body: Record<string, unknown> = { contents }
  if (systemInstruction) body.systemInstruction = systemInstruction
  body.generationConfig = {
    temperature,
    maxOutputTokens: _maxTokens,
  }

  const res = await fetch(`${provider.url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const content = extractGeminiContent(json)
  if (!content) throw new Error('No content in Gemini response')

  return { success: true, data: { raw: content }, provider: provider.name }
}

async function callProviderChat(
  provider: (typeof PROVIDERS)[number],
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<AIResponse> {
  if (provider.format === 'gemini') {
    return callGeminiChat(provider, messages, temperature, maxTokens)
  }
  return callOpenAIChat(provider, messages, temperature, maxTokens)
}

// ── callAI — Chat with 4-Provider Cascade ─────────────────────

export async function callAI(messages: ChatMessage[]): Promise<AIResponse> {
  if (!hasAnyKey()) {
    return { success: false, error: NO_KEY_MESSAGE }
  }

  let lastError: string | undefined

  for (const provider of PROVIDERS) {
    try {
      const result = await callProviderChat(provider, messages, 0.7, 2048)
      if (result.success) return result
      lastError = result.error
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[${provider.name}] chat error: ${msg}`)
      lastError = msg
    }
  }

  return { success: false, error: `All AI providers failed. Last error: ${lastError}` }
}

// ── Provider-Specific Call Functions (Document / Vision) ───────

interface VisionCallOptions {
  prompt: string
  base64Content: string
  mimeType: string
  temperature: number
  maxTokens: number
}

async function callOpenAIVision(
  provider: (typeof PROVIDERS)[number],
  opts: VisionCallOptions
): Promise<AIResponse> {
  const apiKey = getKey(provider.envKey)
  if (!apiKey) return { success: false, error: `No ${provider.envKey}` }

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: opts.prompt },
        {
          type: 'image_url',
          image_url: { url: `data:${opts.mimeType};base64,${opts.base64Content}` },
        },
      ],
    },
  ]

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const content = extractOpenAIContent(json)
  if (!content) throw new Error('No content in vision response')

  return { success: true, data: { raw: content }, provider: provider.name }
}

async function callGeminiVision(
  provider: (typeof PROVIDERS)[number],
  opts: VisionCallOptions
): Promise<AIResponse> {
  const apiKey = getKey(provider.envKey)
  if (!apiKey) return { success: false, error: `No ${provider.envKey}` }

  const contents = [
    {
      role: 'user',
      parts: [
        { text: opts.prompt },
        {
          inlineData: {
            mimeType: opts.mimeType,
            data: opts.base64Content,
          },
        },
      ],
    },
  ]

  const res = await fetch(`${provider.url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as Record<string, unknown>
  const content = extractGeminiContent(json)
  if (!content) throw new Error('No content in Gemini vision response')

  return { success: true, data: { raw: content }, provider: provider.name }
}

async function callProviderVision(
  provider: (typeof PROVIDERS)[number],
  opts: VisionCallOptions
): Promise<AIResponse> {
  if (provider.format === 'gemini') {
    return callGeminiVision(provider, opts)
  }
  return callOpenAIVision(provider, opts)
}

// ── Prompts ───────────────────────────────────────────────────

export const DOCUMENT_SCAN_PROMPT = `You are a financial document analyzer for Pakistan's tax system. Extract the following fields from the document/salary slip:

Return ONLY valid JSON with these fields (use null if not found):
{
  "employeeName": "string",
  "employerName": "string",
  "designation": "string",
  "basicSalary": number,
  "houseRentAllowance": number,
  "conveyanceAllowance": number,
  "medicalAllowance": number,
  "utilityAllowance": number,
  "specialAllowance": number,
  "bonus": number,
  "overtime": number,
  "commission": number,
  "otherAllowances": number,
  "providentFundEmployee": number,
  "providentFundEmployer": number,
  "eobiEmployee": number,
  "incomeTaxDeducted": number,
  "grossSalary": number,
  "netSalary": number,
  "payPeriod": "string (e.g. July 2024)",
  "annualGrossSalary": number
}

Be precise with numbers. If amounts are monthly, compute annual by multiplying by 12.`

export const ENHANCED_EXTRACTION_PROMPT = `You are an expert Pakistani tax document analyzer. Analyze the uploaded document and extract all relevant tax-related information.

Supported document types:
- Salary Slip / Payslip
- Tax Return (FBR)
- Bank Statement
- Property Document
- Business Record / P&L
- Tax Certificate
- Bank Profit Certificate
- General Financial Document

Extract NTN in format 0000000-0 (7 digits, hyphen, 1 digit).
Extract CNIC in format 00000-0000000-0 (5 digits, hyphen, 7 digits, hyphen, 1 digit).

Return ONLY valid JSON (no markdown fences, no extra text) with exactly these fields:
{
  "documentType": "string or null — one of: Salary Slip, Tax Return, Bank Statement, Property Document, Business Record, Tax Certificate, Bank Profit Certificate, General Document",
  "taxYear": "string or null — e.g. 2024",
  "ntn": "string or null — format 0000000-0",
  "cnic": "string or null — format 00000-0000000-0",
  "employerName": "string or null",
  "grossSalary": "number or null — annual gross salary",
  "basicSalary": "number or null — annual basic salary",
  "allowances": "number or null — total annual allowances",
  "taxDeducted": "number or null — total tax deducted",
  "otherIncome": "number or null — other income sources total",
  "businessIncome": "number or null — business/professional income",
  "propertyIncome": "number or null — rental/property income",
  "capitalGains": "number or null — capital gains on investments/property",
  "deductions": "object or null — key-value pairs of deduction names and amounts, e.g. {\"zakat": 5000, \"charity": 3000}",
  "exemptions": "array of strings or null — list of applicable tax exemptions",
  "bankName": "string or null",
  "accountTitle": "string or null",
  "summary": "string — a 1-2 sentence summary of the document contents and key financial figures",
  "rawText": "string or null — any raw numbers or text from the document that didn't fit into other fields",
  "confidence": "number between 0 and 1 — how confident you are in this extraction (1 = very confident, 0 = guessing)"
}

Rules:
- Use null for fields that cannot be determined from the document.
- All monetary values should be annual (multiply monthly amounts by 12).
- Be precise with numbers — do not round or estimate unless necessary.
- If the document type doesn't match any known type, set documentType to "General Document".
- Always provide a meaningful summary even if most fields are null.`

// ── guessDocType ─────────────────────────────────────────────

/** Detect document type from the file name using common patterns. */
export function guessDocType(fileName: string): string {
  const lower = fileName.toLowerCase().replace(/[-_]/g, ' ')

  if (/salary|payslip|pay ?slip|payroll|wage/.test(lower)) return 'Salary Slip'
  if (/tax.?return|fbr|itr|return.?file/.test(lower)) return 'Tax Return'
  if (/bank.?stmt|account.?stmt|statement/.test(lower)) return 'Bank Statement'
  if (/bank.?profit|profit.?cert|profit.?slip|markup/.test(lower)) return 'Bank Profit Certificate'
  if (/property|rent|house|plot|land|flat|apartment/.test(lower)) return 'Property Document'
  if (/business|pnl|p\&l|profit.?loss|income.?stmt|balance.?sheet|trading/.test(lower))
    return 'Business Record'
  if (/tax.?cert|deduction.?cert|withholding.?cert/.test(lower)) return 'Tax Certificate'

  return 'General Document'
}

// ── parseExtractionResponse ───────────────────────────────────

const EMPTY_EXTRACTION: TaxDocumentExtraction = {
  documentType: null,
  taxYear: null,
  ntn: null,
  cnic: null,
  employerName: null,
  grossSalary: null,
  basicSalary: null,
  allowances: null,
  taxDeducted: null,
  otherIncome: null,
  businessIncome: null,
  propertyIncome: null,
  capitalGains: null,
  deductions: null,
  exemptions: null,
  bankName: null,
  accountTitle: null,
  summary: '',
  rawText: null,
  confidence: 0,
}

/** Parse a raw LLM response string into a TaxDocumentExtraction with fallback. */
export function parseExtractionResponse(
  raw: string,
  provider?: string,
  fileName?: string
): TaxDocumentExtraction {
  // Try to extract JSON from the response — it may be wrapped in markdown fences
  let jsonStr = raw.trim()

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim()
  }

  // Try to find a JSON object if there's surrounding text
  const braceStart = jsonStr.indexOf('{')
  const braceEnd = jsonStr.lastIndexOf('}')
  if (braceStart !== -1 && braceEnd > braceStart) {
    jsonStr = jsonStr.slice(braceStart, braceEnd + 1)
  }

  try {
    const parsed = JSON.parse(jsonStr) as Partial<TaxDocumentExtraction>
    return {
      documentType: typeof parsed.documentType === 'string' ? parsed.documentType : null,
      taxYear: typeof parsed.taxYear === 'string' ? parsed.taxYear : null,
      ntn: typeof parsed.ntn === 'string' ? parsed.ntn : null,
      cnic: typeof parsed.cnic === 'string' ? parsed.cnic : null,
      employerName: typeof parsed.employerName === 'string' ? parsed.employerName : null,
      grossSalary:
        typeof parsed.grossSalary === 'number' && !isNaN(parsed.grossSalary)
          ? parsed.grossSalary
          : null,
      basicSalary:
        typeof parsed.basicSalary === 'number' && !isNaN(parsed.basicSalary)
          ? parsed.basicSalary
          : null,
      allowances:
        typeof parsed.allowances === 'number' && !isNaN(parsed.allowances)
          ? parsed.allowances
          : null,
      taxDeducted:
        typeof parsed.taxDeducted === 'number' && !isNaN(parsed.taxDeducted)
          ? parsed.taxDeducted
          : null,
      otherIncome:
        typeof parsed.otherIncome === 'number' && !isNaN(parsed.otherIncome)
          ? parsed.otherIncome
          : null,
      businessIncome:
        typeof parsed.businessIncome === 'number' && !isNaN(parsed.businessIncome)
          ? parsed.businessIncome
          : null,
      propertyIncome:
        typeof parsed.propertyIncome === 'number' && !isNaN(parsed.propertyIncome)
          ? parsed.propertyIncome
          : null,
      capitalGains:
        typeof parsed.capitalGains === 'number' && !isNaN(parsed.capitalGains)
          ? parsed.capitalGains
          : null,
      deductions:
        parsed.deductions && typeof parsed.deductions === 'object' && !Array.isArray(parsed.deductions)
          ? (parsed.deductions as Record<string, number>)
          : null,
      exemptions: Array.isArray(parsed.exemptions) ? (parsed.exemptions as string[]) : null,
      bankName: typeof parsed.bankName === 'string' ? parsed.bankName : null,
      accountTitle: typeof parsed.accountTitle === 'string' ? parsed.accountTitle : null,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      rawText: typeof parsed.rawText === 'string' ? parsed.rawText : null,
      confidence:
        typeof parsed.confidence === 'number' && !isNaN(parsed.confidence)
          ? Math.min(1, Math.max(0, parsed.confidence))
          : 0.3,
      provider,
    }
  } catch {
    // JSON parsing failed — return a minimal extraction with the raw text
    const docHint = fileName ? guessDocType(fileName) : null
    return {
      ...EMPTY_EXTRACTION,
      documentType: docHint,
      summary: `Document analysis failed to parse structured data. Raw response: ${raw.slice(0, 200)}`,
      rawText: raw,
      confidence: 0,
      provider,
    }
  }
}

// ── analyzeDocument ───────────────────────────────────────────

/**
 * Analyze a document (image/PDF as base64) and extract tax-relevant information.
 * Cascades through HuggingFace → Gemini → Grok → OpenAI.
 */
export async function analyzeDocument(
  base64Content: string,
  mimeType: string
): Promise<TaxDocumentExtraction> {
  if (!hasAnyKey()) {
    return {
      ...EMPTY_EXTRACTION,
      summary: NO_KEY_MESSAGE,
      confidence: 0,
    }
  }

  let lastError: string | undefined

  const visionOpts: VisionCallOptions = {
    prompt: ENHANCED_EXTRACTION_PROMPT,
    base64Content,
    mimeType,
    temperature: 0.1,
    maxTokens: 4096,
  }

  for (const provider of PROVIDERS) {
    try {
      const result = await callProviderVision(provider, visionOpts)
      if (result.success && result.data?.raw) {
        const rawStr = String(result.data.raw)
        return parseExtractionResponse(rawStr, result.provider)
      }
      lastError = result.error
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[${provider.name}] vision error: ${msg}`)
      lastError = msg
    }
  }

  return {
    ...EMPTY_EXTRACTION,
    summary: `All AI providers failed for document analysis. Last error: ${lastError}`,
    rawText: lastError ?? null,
    confidence: 0,
  }
}

// ── Re-exported for backward compatibility ─────────────────────

export type { ChatMessage, ContentPart, AIResponse }

// ============================================================
// TaxMind Pakistan - AI Provider (Vercel-Compatible)
// ============================================================
// Supports: Hugging Face (FREE), Google Gemini, xAI Grok, OpenAI
// All calls are plain HTTP fetch — works in Vercel serverless functions.
// Priority: HF_API_KEY > GEMINI_API_KEY > XAI_API_KEY > OPENAI_API_KEY > fallback
// ============================================================

interface TaxExtraction {
  documentType: string | null;
  taxYear: string | null;
  ntn: string | null;
  cnic: string | null;
  employerName: string | null;
  grossSalary: number | null;
  basicSalary: number | null;
  allowances: number | null;
  taxDeducted: number | null;
  otherIncome: number | null;
  businessIncome: number | null;
  propertyIncome: number | null;
  capitalGains: number | null;
  deductions: Record<string, number> | null;
  exemptions: string[] | null;
  bankName: string | null;
  accountTitle: string | null;
  summary: string;
  rawText: string | null;
  confidence: number;
}

const EXTRACTION_PROMPT = `You are a professional Pakistani tax document analyzer. Analyze this document and extract ALL financial data.

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no extra text).

Required JSON structure:
{
  "documentType": "Salary Slip" | "Tax Return" | "Bank Statement" | "Property Document" | "Business Record" | "Tax Certificate" | "Other",
  "taxYear": "2024-2025" or null,
  "ntn": "0000000-0" or null,
  "cnic": "00000-0000000-0" or null,
  "employerName": "Company Name" or null,
  "grossSalary": 0 or null,
  "basicSalary": 0 or null,
  "allowances": 0 or null,
  "taxDeducted": 0 or null,
  "otherIncome": 0 or null,
  "businessIncome": 0 or null,
  "propertyIncome": 0 or null,
  "capitalGains": 0 or null,
  "deductions": {"Zakat": 0, "ProvidentFund": 0} or null,
  "exemptions": ["list of exemptions"] or null,
  "bankName": "Bank name" or null,
  "accountTitle": "Account holder" or null,
  "summary": "Brief 2-3 sentence summary of the document contents",
  "rawText": "All visible text from the document" or null,
  "confidence": 0.0 to 1.0
}

Rules:
- Extract EXACT PKR amounts as numbers (no commas, no currency symbols)
- If a field is not found, set it to null (not 0)
- For NTN: format as 0000000-0
- For CNIC: format as 00000-0000000-0
- Set confidence based on document clarity (1.0 = perfectly clear, 0.5 = partially readable, 0.1 = very unclear)
- For Pakistani salary slips, look for: basic salary, house rent, conveyance, medical, utilities, bonus, tax deducted
- For bank statements, look for: profit/ Markup, withholding tax, account title
- For tax returns, look for: total income, tax payable, tax already paid, tax refund`;

// ─── Hugging Face Provider (FREE — works in Pakistan) ──────────
async function analyzeWithHuggingFace(base64Content: string, mimeType: string): Promise<TaxExtraction> {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error('HF_API_KEY not set');

  const model = process.env.HF_MODEL || 'Qwen/Qwen2.5-VL-7B-Instruct';

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Content}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Hugging Face returned empty response');

  return parseAIResponse(content);
}

// ─── Google Gemini Provider ─────────────────────────────────
async function analyzeWithGemini(base64Content: string, mimeType: string): Promise<TaxExtraction> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: EXTRACTION_PROMPT },
            { inlineData: { mimeType, data: base64Content } },
          ],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');

  return parseAIResponse(text);
}

// ─── xAI Grok Provider (OpenAI-compatible) ──────────────────
async function analyzeWithGrok(base64Content: string, mimeType: string): Promise<TaxExtraction> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY not set');

  const model = process.env.XAI_MODEL || 'grok-4-latest';

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Content}`, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`xAI Grok API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('xAI Grok returned empty response');

  return parseAIResponse(content);
}

// ─── OpenAI Provider ─────────────────────────────────────────
async function analyzeWithOpenAI(base64Content: string, mimeType: string): Promise<TaxExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Content}`, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');

  return parseAIResponse(content);
}

// ─── Response Parser ─────────────────────────────────────────
function parseAIResponse(raw: string): TaxExtraction {
  let jsonStr = raw.trim();

  // Strip markdown code blocks if the AI wraps them
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      documentType: parsed.documentType || null,
      taxYear: parsed.taxYear || null,
      ntn: parsed.ntn || null,
      cnic: parsed.cnic || null,
      employerName: parsed.employerName || null,
      grossSalary: parsed.grossSalary || null,
      basicSalary: parsed.basicSalary || null,
      allowances: parsed.allowances || null,
      taxDeducted: parsed.taxDeducted || null,
      otherIncome: parsed.otherIncome || null,
      businessIncome: parsed.businessIncome || null,
      propertyIncome: parsed.propertyIncome || null,
      capitalGains: parsed.capitalGains || null,
      deductions: parsed.deductions || null,
      exemptions: parsed.exemptions || null,
      bankName: parsed.bankName || null,
      accountTitle: parsed.accountTitle || null,
      summary: parsed.summary || 'Document analyzed successfully',
      rawText: parsed.rawText || null,
      confidence: parsed.confidence || 0.5,
    };
  } catch {
    return {
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
      summary: 'Document was analyzed but data extraction needs review. Please verify data manually.',
      rawText: raw.substring(0, 500),
      confidence: 0.2,
    };
  }
}

// ─── Main Export ─────────────────────────────────────────────
export async function analyzeDocument(base64Content: string, mimeType: string): Promise<TaxExtraction> {
  // Priority 1: Hugging Face (FREE, works in Pakistan, no credit card)
  if (process.env.HF_API_KEY) {
    try {
      const result = await analyzeWithHuggingFace(base64Content, mimeType);
      result._provider = 'huggingface';
      return result;
    } catch (error: any) {
      console.error('Hugging Face analysis failed:', error.message);
    }
  }

  // Priority 2: Google Gemini (free tier, may not work in Pakistan)
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await analyzeWithGemini(base64Content, mimeType);
      result._provider = 'google-gemini';
      return result;
    } catch (error: any) {
      console.error('Gemini analysis failed:', error.message);
    }
  }

  // Priority 3: xAI Grok (fast, strong vision, affordable)
  if (process.env.XAI_API_KEY) {
    try {
      const result = await analyzeWithGrok(base64Content, mimeType);
      result._provider = 'xai-grok';
      return result;
    } catch (error: any) {
      console.error('xAI Grok analysis failed:', error.message);
    }
  }

  // Priority 4: OpenAI GPT-4o-mini (paid, reliable)
  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await analyzeWithOpenAI(base64Content, mimeType);
      result._provider = 'openai';
      return result;
    } catch (error: any) {
      console.error('OpenAI analysis failed:', error.message);
    }
  }

  // No API key configured
  return {
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
    summary: 'AI analysis is not configured. Set HF_API_KEY (free from huggingface.co) in your environment variables. The tax calculator and optimizer work independently — you can enter data manually.',
    rawText: null,
    confidence: 0,
    _provider: 'none',
  } as TaxExtraction & { _provider: string };
}

// Helper: guess document type from filename
export function guessDocType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes('salary')) return 'Salary Slip';
  if (lower.includes('tax') && lower.includes('return')) return 'Tax Return';
  if (lower.includes('tax') && lower.includes('cert')) return 'Tax Certificate';
  if (lower.includes('bank')) return 'Bank Statement';
  if (lower.includes('property')) return 'Property Document';
  if (lower.includes('business')) return 'Business Record';
  if (lower.includes('profit') || lower.includes('markup')) return 'Bank Profit Certificate';
  return 'General Document';
}

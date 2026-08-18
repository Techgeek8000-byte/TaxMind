import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIWithContext, type ChatMessage } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import { calculateTax, type TaxInput, type TaxResult } from '@/lib/tax-engine'

// ─── Schemas ────────────────────────────────────────────────────────

const autoCalcSchema = z.object({
  extractedData: z.record(z.string(), z.unknown()),
  documentType: z.string().optional(),
  fileName: z.string().optional(),
})

// ─── Document Type → Income Head Router ─────────────────────────────

function routeDocumentToIncomeHead(
  docType: string | null | undefined,
  data: Record<string, unknown>
): { incomeHead: TaxInput['incomeHead']; entityType?: TaxInput['entityType']; confidence: string } {
  // Explicit document type
  if (docType) {
    const t = docType.toLowerCase()
    if (t.includes('salary') || t.includes('payslip'))
      return { incomeHead: 'salary', entityType: 'individual_salary', confidence: 'high' }
    if (t.includes('bank') && (t.includes('profit') || t.includes('markup')))
      return { incomeHead: 'other', confidence: 'medium' }
    if (t.includes('bank') && t.includes('stmt'))
      return { incomeHead: 'business', entityType: 'individual_business', confidence: 'medium' }
    if (t.includes('property') || t.includes('rent'))
      return { incomeHead: 'property', confidence: 'high' }
    if (t.includes('business') || t.includes('pnl') || t.includes('profit') || t.includes('loss'))
      return { incomeHead: 'business', entityType: 'individual_business', confidence: 'high' }
    if (t.includes('tax') && t.includes('cert'))
      return { incomeHead: 'salary', confidence: 'medium' }
    if (t.includes('capital'))
      return { incomeHead: 'capital_gains', confidence: 'high' }
  }

  // Infer from extracted data fields
  const has = (k: string) => data[k] != null && data[k] !== '' && data[k] !== 0

  if (has('employerName') || has('basicSalary') || has('employeeName')) {
    return { incomeHead: 'salary', entityType: 'individual_salary', confidence: 'high' }
  }
  if (has('businessIncome') && Number(data.businessIncome) > 0) {
    return { incomeHead: 'business', entityType: 'individual_business', confidence: 'high' }
  }
  if (has('propertyIncome') && Number(data.propertyIncome) > 0) {
    return { incomeHead: 'property', confidence: 'high' }
  }
  if (has('capitalGains') && Number(data.capitalGains) > 0) {
    return { incomeHead: 'capital_gains', confidence: 'high' }
  }
  if (has('bankName') || has('bankProfit')) {
    return { incomeHead: 'other', confidence: 'medium' }
  }

  return { incomeHead: 'salary', entityType: 'individual_salary', confidence: 'low' }
}

// ─── Extracted Data → TaxInput Converter ────────────────────────────

function buildTaxInput(
  data: Record<string, unknown>,
  routing: { incomeHead: TaxInput['incomeHead']; entityType?: TaxInput['entityType'] }
): TaxInput {
  const num = (k: string) => {
    const v = Number(data[k])
    return isNaN(v) ? 0 : v
  }

  const str = (k: string) => (data[k] != null ? String(data[k]) : '')

  // Calculate gross income from salary components
  let grossIncome = 0
  if (routing.incomeHead === 'salary') {
    grossIncome =
      num('grossSalary') ||
      num('annualGrossSalary') ||
      num('basicSalary') +
        num('houseRentAllowance') +
        num('conveyanceAllowance') +
        num('medicalAllowance') +
        num('utilityAllowance') +
        num('specialAllowance') +
        num('bonus') +
        num('overtime') +
        num('commission') +
        num('otherAllowances')
  } else if (routing.incomeHead === 'business') {
    grossIncome = num('businessIncome') || num('grossSalary') || 0
  } else if (routing.incomeHead === 'property') {
    grossIncome = num('propertyIncome') || num('grossSalary') || 0
  } else if (routing.incomeHead === 'capital_gains') {
    grossIncome = num('capitalGains') || num('grossSalary') || 0
  } else {
    grossIncome = num('otherIncome') || num('grossSalary') || 0
  }

  // Get tax year
  const rawYear = str('taxYear')
  let taxYear = new Date().getFullYear().toString()
  if (rawYear && /^\d{4}$/.test(rawYear)) {
    // If the year looks like a calendar year, convert to tax year
    const y = parseInt(rawYear, 10)
    if (y >= 2020 && y <= 2030) taxYear = rawYear
  }

  const input: TaxInput = {
    incomeHead: routing.incomeHead,
    taxYear,
    grossIncome,
    entityType: routing.entityType,
    isFiler: true,
    ntn: str('ntn') || undefined,
    cnic: str('cnic') || undefined,
  }

  // Auto-detect and apply provident fund as Sec 64D deduction
  const pfEmployee = num('providentFundEmployee')
  if (pfEmployee > 0) {
    input.sec64DEmployerProvidentFund = pfEmployee
  }
  const pfEmployer = num('providentFundEmployer')
  // Employer PF contribution is not a deduction for the employee — skip it

  // Auto-detect EOBI as Sec 64E
  const eobi = num('eobiEmployee')
  if (eobi > 0) {
    input.sec64EEmployeeOldAge = eobi
  }

  // Auto-detect zakat (common on salary slips)
  if (num('zakat') > 0) {
    input.sec62Zakat = num('zakat')
  }

  // If income tax was already deducted, record it for reference
  // (the engine handles this as withholding tax)

  return input
}

// ─── AI Deduction Advisor ──────────────────────────────────────────

const DEDUCTION_ADVISOR_PROMPT = `You are TaxMind AI Deduction Advisor. Based on a taxpayer's extracted document data and income, suggest which FBR ITO 2001 deduction sections they should claim.

Available deduction sections:
- Sec 60: Pension Fund Investment (max 20% of taxable income)
- Sec 61: Life Insurance Premium (max 20% of taxable income)
- Sec 62: Zakat (unlimited)
- Sec 63: Children Education Allowance (max 5% of taxable income)
- Sec 64: Health Insurance Premium (max 5% of taxable income)
- Sec 64A: Charity/Donation (max 30% of taxable income)
- Sec 64B: Domestic Travel (max 2% of taxable income)
- Sec 64C: Computer/IT Equipment (max 5% of taxable income)
- Sec 64D: Employer Provident Fund (max 20% of taxable income)
- Sec 64E: Employee Old Age Benefits (max 20% of taxable income)
- Sec 65: House Building Loan Interest (as per actual)

You MUST respond with ONLY valid JSON:
{
  "deductions": [
    {
      "section": "sec64D",
      "label": "Employer Provident Fund",
      "amount": 24000,
      "reason": "Detected PKR 2,000/month employer provident fund on salary slip",
      "confidence": "high"
    }
  ],
  "explanation": "string (2-3 sentences explaining your recommendations)",
  "totalEstimatedSavings": "string (e.g. PKR 15,000-45,000/year)"
}

Rules:
- Only suggest deductions the user can actually claim based on the document evidence
- If a deduction was already detected in the document data, include it
- Estimate amounts based on common Pakistani employer practices if not explicitly in the document
- Be conservative — don't suggest deductions without evidence
- If the user is salaried, Sec 63 (education) and Sec 64 (health insurance) are commonly applicable
- Include 2-5 deductions max
- Amounts should be ANNUAL`

const DEDUCTION_ADVISOR_SYSTEM_PROMPT = `You are TaxMind AI Deduction Advisor for Pakistan ITO 2001. You analyze a taxpayer's profile and suggest applicable tax deduction sections with estimated annual amounts. Be specific and evidence-based.`

async function getAIDeductionSuggestions(
  taxInput: TaxInput,
  extractedData: Record<string, unknown>
): Promise<{
  deductions: { section: string; label: string; amount: number; reason: string; confidence: string }[]
  explanation: string
  totalEstimatedSavings: string
}> {
  const dataSummary = Object.entries(extractedData)
    .filter(([, v]) => v != null && v !== '' && v !== 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: DEDUCTION_ADVISOR_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: `Analyze this taxpayer and suggest deductions:

Income Head: ${taxInput.incomeHead}
Gross Annual Income: PKR ${taxInput.grossIncome.toLocaleString()}
Tax Year: ${taxInput.taxYear}

Extracted Document Data:
${dataSummary}

Already detected deductions:
- Sec 64D (Employer PF): PKR ${taxInput.sec64DEmployerProvidentFund?.toLocaleString() ?? '0'}
- Sec 64E (EOBI): PKR ${taxInput.sec64EEmployeeOldAge?.toLocaleString() ?? '0'}
- Sec 62 (Zakat): PKR ${taxInput.sec62Zakat?.toLocaleString() ?? '0'}

Suggest additional deductions they should claim.`,
    },
  ]

  const result = await callAIWithContext({ messages, maxTokens: 2048, temperature: 0.4, jsonMode: true })

  const empty = { deductions: [], explanation: 'Could not generate AI deduction suggestions.', totalEstimatedSavings: 'N/A' }

  if (!result.success || !result.data?.raw) return empty

  try {
    const raw = String(result.data.raw).trim()
    const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
    const braceStart = jsonStr.indexOf('{')
    const braceEnd = jsonStr.lastIndexOf('}')
    return JSON.parse(jsonStr.slice(braceStart !== -1 ? braceStart : 0, braceEnd !== -1 ? braceEnd + 1 : undefined))
  } catch {
    return empty
  }
}

// ─── POST Handler ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = autoCalcSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { extractedData, documentType, fileName } = parsed.data
    const data = extractedData as Record<string, unknown>

    // Step 1: Route document to correct income head
    const routing = routeDocumentToIncomeHead(documentType, data)

    // Step 2: Build TaxInput from extracted data
    let taxInput = buildTaxInput(data, routing)

    // Step 3: Run initial calculation (without AI deductions)
    let initialResult: TaxResult
    try {
      initialResult = calculateTax(taxInput)
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Tax calculation failed. Please check the extracted data.' },
        { status: 422 }
      )
    }

    // Step 4: Get AI deduction suggestions (run in parallel with step 3 already done)
    const aiDeductions = await getAIDeductionSuggestions(taxInput, data)

    // Step 5: Apply AI-suggested deductions and recalculate
    const optimizedInput = { ...taxInput }
    for (const d of aiDeductions.deductions) {
      const key = d.section as keyof TaxInput
      if (key in optimizedInput && typeof d.amount === 'number' && d.amount > 0) {
        // Only set if not already set from document extraction
        if (!optimizedInput[key] || (optimizedInput[key] as number) === 0) {
          ;(optimizedInput as Record<string, unknown>)[key] = d.amount
        }
      }
    }

    let optimizedResult: TaxResult
    try {
      optimizedResult = calculateTax(optimizedInput)
    } catch {
      optimizedResult = initialResult
    }

    const taxSaved = initialResult.totalTax - optimizedResult.totalTax

    return NextResponse.json({
      success: true,
      data: {
        // Routing info
        documentType: documentType || routing.incomeHead,
        routedTo: routing.incomeHead,
        routingConfidence: routing.confidence,
        fileName: fileName || null,

        // Tax input that was used
        taxInput: {
          incomeHead: optimizedInput.incomeHead,
          taxYear: optimizedInput.taxYear,
          grossIncome: optimizedInput.grossIncome,
          entityType: optimizedInput.entityType,
          isFiler: optimizedInput.isFiler,
          ntn: optimizedInput.ntn,
          cnic: optimizedInput.cnic,
        },

        // Initial calculation (no AI deductions)
        initialCalculation: {
          grossIncome: initialResult.grossIncome,
          totalDeductions: initialResult.totalDeductions,
          taxableIncome: initialResult.taxableIncome,
          taxComputed: initialResult.taxComputed,
          superTax: initialResult.superTax,
          totalTax: initialResult.totalTax,
          effectiveRate: initialResult.effectiveRate,
          slabs: initialResult.breakdown.slabs,
        },

        // Optimized calculation (with AI deductions)
        optimizedCalculation: {
          totalDeductions: optimizedResult.totalDeductions,
          taxableIncome: optimizedResult.taxableIncome,
          taxComputed: optimizedResult.taxComputed,
          superTax: optimizedResult.superTax,
          totalTax: optimizedResult.totalTax,
          effectiveRate: optimizedResult.effectiveRate,
          slabs: optimizedResult.breakdown.slabs,
          deductions: optimizedResult.breakdown.deductions,
        },

        // AI deduction suggestions
        aiDeductions,

        // Savings achieved
        taxSaved,
        savingsPercentage: initialResult.totalTax > 0 ? ((taxSaved / initialResult.totalTax) * 100).toFixed(1) : '0',
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/auto-calculate]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

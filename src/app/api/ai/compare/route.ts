import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIWithContext } from '@/lib/ai'
import { getSession } from '@/lib/auth'

const compareBodySchema = z.object({
  income: z.number().min(0),
  taxYear1: z.string().regex(/^\d{4}$/),
  taxYear2: z.string().regex(/^\d{4}$/),
  incomeHead: z.string().optional(),
  entityType: z.string().optional(),
  deductions: z.record(z.string(), z.number()).optional(),
})

const COMPARE_SYSTEM_PROMPT = `You are TaxMind AI, an expert Pakistani tax analyst. You compare tax liabilities between two tax years under FBR ITO 2001.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "year1": {
    "year": string,
    "taxableIncome": number,
    "taxComputed": number,
    "effectiveRate": number (as percentage),
    "applicableSlabs": [{ "range": string, "rate": string, "tax": string }],
    "keyChanges": string (1-2 sentences about what changed this year)
  },
  "year2": {
    "year": string,
    "taxableIncome": number,
    "taxComputed": number,
    "effectiveRate": number,
    "applicableSlabs": [{ "range": string, "rate": string, "tax": string }],
    "keyChanges": string
  },
  "comparison": {
    "taxDifference": number (positive = year2 is more expensive),
    "rateChange": string (e.g. "+2.5%" or "-1%"),
    "savingsOrExtra": string (e.g. "You save PKR 45,000" or "You pay PKR 30,000 extra"),
    "explanation": string (3-4 sentences explaining the key differences between the two years' tax regimes, referencing specific ITO amendments)
  },
  "recommendation": string (2-3 sentences advising the user on what to do given the changes)
}

Use accurate FBR tax slabs. For Tax Year 2024-2025 (July 2024-June 2025 income): salary slabs are 0-600K (0%), 600K-1.2M (5%), 1.2M-2.2M (15%), 2.2M-3.2M (25%), 3.2M-4.1M (30%), >4.1M (35%). For non-salary: 0-600K (0%), 600K-1.2M (15%), >1.2M (30%). For earlier years use historically accurate rates.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = compareBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { income, taxYear1, taxYear2, incomeHead, entityType, deductions } = parsed.data

    const deductionsStr = deductions
      ? Object.entries(deductions)
          .map(([k, v]) => `${k}: PKR ${(v as number).toLocaleString()}`)
          .join(', ')
      : 'None specified'

    const messages = [
      { role: 'system' as const, content: COMPARE_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `Compare tax liability for the following taxpayer between Tax Year ${taxYear1} and Tax Year ${taxYear2}:

- Gross Annual Income: PKR ${income.toLocaleString()}
- Income Head: ${incomeHead || 'Salary (default)'}
- Entity Type: ${entityType || 'Individual (Salaried)'}
- Deductions: ${deductionsStr}

Calculate the actual tax under both years' slab rates, show the slab-by-slab breakdown, and explain what changed between these two tax years. Be precise with PKR amounts.`,
      },
    ]

    const aiResponse = await callAIWithContext({ messages, maxTokens: 4096, temperature: 0.3, jsonMode: true })

    if (!aiResponse.success || !aiResponse.data?.raw) {
      return NextResponse.json(
        { success: false, error: aiResponse.error || 'AI service unavailable' },
        { status: 503 }
      )
    }

    let parsedCompare: Record<string, unknown>
    try {
      const raw = String(aiResponse.data.raw).trim()
      const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
      const braceStart = jsonStr.indexOf('{')
      const braceEnd = jsonStr.lastIndexOf('}')
      parsedCompare = JSON.parse(jsonStr.slice(braceStart !== -1 ? braceStart : 0, braceEnd !== -1 ? braceEnd + 1 : undefined))
    } catch {
      parsedCompare = {
        year1: { year: taxYear1, keyChanges: 'Could not parse comparison data' },
        year2: { year: taxYear2, keyChanges: 'Could not parse comparison data' },
        comparison: { explanation: String(aiResponse.data.raw) },
        recommendation: 'Please try again.',
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...parsedCompare, provider: aiResponse.provider },
    })
  } catch (error) {
    console.error('[POST /api/ai/compare]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

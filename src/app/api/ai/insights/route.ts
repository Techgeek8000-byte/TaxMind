import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIWithContext } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

const insightsBodySchema = z.object({
  incomeHead: z.string().optional(),
  incomeRange: z.string().optional(),
  entityType: z.string().optional(),
  isFiler: z.boolean().optional(),
})

const INSIGHTS_SYSTEM_PROMPT = `You are TaxMind AI Insights Engine. You analyze a user's tax profile and produce highly actionable, personalized tax saving recommendations for Pakistan ITO 2001 (Tax Year 2024-2025).

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "score": number (0-100, how well they are optimizing their tax),
  "summary": string (2-3 sentence overall assessment),
  "insights": [
    {
      "category": string (one of: "Deductions", "Exemptions", "Structuring", "Compliance", "Planning"),
      "title": string (short actionable title),
      "description": string (2-3 sentences explaining the insight),
      "savingsEstimate": string (e.g. "PKR 50,000-120,000/year"),
      "sections": string[] (relevant ITO section numbers),
      "priority": string ("High" | "Medium" | "Low"),
      "actionable": string (specific next step the user should take)
    }
  ],
  "missedDeductions": string[] (list of deduction sections they should consider),
  "riskFactors": string[] (potential FBR red flags or compliance issues)
}

Produce 6-10 insights. Be specific with PKR amounts where possible. Reference actual ITO sections.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = insightsBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    // Fetch user's calculation history for personalized context
    let userContext = ''
    try {
      const calcs = await db.taxCalculation.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          taxYear: true,
          incomeHead: true,
          grossIncome: true,
          totalTax: true,
          effectiveRate: true,
          savingsAchieved: true,
        },
      })
      if (calcs.length > 0) {
        userContext = `\n\n<UserTaxHistory>\n${calcs
          .map(
            (c) =>
              `TY ${c.taxYear}: ${c.incomeHead} income PKR ${c.grossIncome?.toLocaleString() ?? 'N/A'}, Tax PKR ${c.totalTax?.toLocaleString() ?? 'N/A'}, Effective Rate ${c.effectiveRate ?? 'N/A'}%, Savings PKR ${c.savingsAchieved?.toLocaleString() ?? 'N/A'}`
          )
          .join('\n')}\n</UserTaxHistory>`
      }
    } catch {
      // DB might be unavailable in dev — proceed without history
    }

    const { incomeHead, incomeRange, entityType, isFiler } = parsed.data

    const userProfile = `\n\n<UserProfile>
Income Head: ${incomeHead || 'Not specified'}
Income Range: ${incomeRange || 'Not specified'}
Entity Type: ${entityType || 'Individual'}
Filer Status: ${isFiler ? 'Active Filer' : 'Non-Filer / Unknown'}
Email: ${session.email}
</UserProfile>${userContext}`

    const messages = [
      { role: 'system' as const, content: INSIGHTS_SYSTEM_PROMPT + userProfile },
      {
        role: 'user' as const,
        content: `Generate personalized tax insights for this Pakistani taxpayer. Consider their income head, entity type, and filer status. Provide specific, actionable recommendations with estimated PKR savings where applicable.${incomeHead ? ` They earn from ${incomeHead}.` : ''}${incomeRange ? ` Their income range is ${incomeRange}.` : ''}${entityType ? ` They file as ${entityType}.` : ''}`,
      },
    ]

    const aiResponse = await callAIWithContext({ messages, maxTokens: 4096, temperature: 0.5, jsonMode: true })

    if (!aiResponse.success || !aiResponse.data?.raw) {
      return NextResponse.json(
        { success: false, error: aiResponse.error || 'AI service unavailable' },
        { status: 503 }
      )
    }

    let parsedInsights: Record<string, unknown>
    try {
      const raw = String(aiResponse.data.raw).trim()
      const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
      const braceStart = jsonStr.indexOf('{')
      const braceEnd = jsonStr.lastIndexOf('}')
      parsedInsights = JSON.parse(jsonStr.slice(braceStart !== -1 ? braceStart : 0, braceEnd !== -1 ? braceEnd + 1 : undefined))
    } catch {
      parsedInsights = { score: 0, summary: String(aiResponse.data.raw), insights: [], missedDeductions: [], riskFactors: [] }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...parsedInsights,
        provider: aiResponse.provider,
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/insights]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

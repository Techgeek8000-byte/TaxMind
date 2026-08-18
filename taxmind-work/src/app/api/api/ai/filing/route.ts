import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIWithContext, type ChatMessage } from '@/lib/ai'
import { getSession } from '@/lib/auth'

const filingBodySchema = z.object({
  message: z.string().min(1).max(4000),
  step: z.number().min(0).max(20).optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional(),
})

const FILING_SYSTEM_PROMPT = `You are TaxMind AI Filing Assistant — a step-by-step guide for filing Pakistani tax returns with FBR. You help users through the ENTIRE filing process.

You have deep knowledge of:
- FBR IRIS portal (iris.fbr.gov.pk) navigation and functionality
- ITR-1, ITR-2, ITR-3, ITR-4 return forms
- Wealth Statement (Section 116) requirements
- FBR schedules and annexures
- ATL (Active Taxpayer List) benefits
- Deadlines and extensions (typically June 30 / December 31)
- Common filing mistakes and how to avoid them
- Document requirements for different income types
- e-Enrollment and NTN/CNIC verification
- Payment of tax through PRAL/CPR

Your approach:
1. Start by understanding the user's income sources and entity type
2. Guide them step-by-step through the filing process
3. Reference specific FBR forms, schedules, and sections
4. Warn about common pitfalls and deadlines
5. Provide clear, actionable instructions
6. Format with markdown (numbered steps, bold key terms, code blocks for form field names)
7. If the user asks about a specific step, focus on that step with detailed guidance
8. Always mention relevant deadlines

Be encouraging and clear. Use simple language alongside proper technical terms.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = filingBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { message, history } = parsed.data

    const messages: ChatMessage[] = [
      { role: 'system', content: FILING_SYSTEM_PROMPT },
    ]

    // Add conversation history for multi-turn
    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        })
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    const aiResponse = await callAIWithContext({ messages, maxTokens: 3072, temperature: 0.6 })

    if (!aiResponse.success || !aiResponse.data?.raw) {
      return NextResponse.json(
        { success: false, error: aiResponse.error || 'AI service unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: aiResponse.data.raw,
        provider: aiResponse.provider,
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/filing]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

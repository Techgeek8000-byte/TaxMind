import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIWithContext, type ChatMessage } from '@/lib/ai'
import { getSession } from '@/lib/auth'

const floatingBodySchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.string().max(3000).optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(10)
    .optional(),
})

const FLOATING_SYSTEM_PROMPT = `You are TaxMind AI — a quick-access Pakistani tax assistant. You answer concisely (2-4 sentences max) unless the user asks for detail. Reference ITO sections when relevant. Be friendly and direct.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = floatingBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { message, context, history } = parsed.data

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: FLOATING_SYSTEM_PROMPT + (context ? `\n\n<PageContext>${context}</PageContext>\nUse the page context to give relevant answers.` : ''),
      },
    ]

    // Add conversation history (last 10 turns)
    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        })
      }
    }

    messages.push({ role: 'user', content: message })

    const aiResponse = await callAIWithContext({ messages, maxTokens: 1024, temperature: 0.7 })

    if (!aiResponse.success || !aiResponse.data?.raw) {
      return NextResponse.json(
        { success: false, error: aiResponse.error || 'AI service unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { reply: aiResponse.data.raw, provider: aiResponse.provider },
    })
  } catch (error) {
    console.error('[POST /api/ai/floating-chat]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

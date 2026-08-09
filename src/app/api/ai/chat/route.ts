import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAI } from '@/lib/ai'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// ─── System Prompt ─────────────────────────────────────────────────────────

const TAXMIND_SYSTEM_PROMPT = `You are TaxMind AI, an expert Pakistani tax advisor. You have deep knowledge of FBR ITO 2001, Tax Year 2024-2025 rates, all deduction sections (60-65E), presumive tax regimes (Sec 113-116B), capital gains tax, wealth statements, and legal tax optimization strategies. Answer accurately with specific ITO section references. Format responses with markdown. If asked about non-tax topics, politely redirect.`

// ─── Schemas ────────────────────────────────────────────────────────────────

const chatBodySchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000),
  context: z.string().max(2000).optional(),
})

// ─── POST: AI chat endpoint ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = chatBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { message, context } = parsed.data

    // Optionally get session for user context (no auth required for AI chat)
    const session = await getSession()

    // Build system prompt with optional user context
    let systemPrompt = TAXMIND_SYSTEM_PROMPT
    if (session) {
      systemPrompt += `

The current user is logged in: ${session.email}${session.name ? ` (${session.name})` : ''}. You may reference their account when relevant.`
    }
    if (context) {
      systemPrompt += `

Additional context provided by the user: ${context}`
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ]

    const aiResponse = await callAI(messages)

    if (!aiResponse.success || !aiResponse.data) {
      return NextResponse.json(
        { success: false, error: aiResponse.error || 'AI service unavailable' },
        { status: 503 },
      )
    }

    // Extract the raw text response
    const reply = aiResponse.data.raw || JSON.stringify(aiResponse.data)

    return NextResponse.json({
      success: true,
      data: {
        reply,
        provider: aiResponse.provider,
      },
    })
  } catch (error) {
    console.error('[POST /api/ai/chat]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

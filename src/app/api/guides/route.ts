import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const guides = await db.taxGuide.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(guides)
  } catch (error) {
    console.error('Guides list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createGuideSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  order: z.number().int().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Admin-only — auth skipped for now
    const body = await request.json()
    const parsed = createGuideSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const guide = await db.taxGuide.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description,
        content: parsed.data.content,
        category: parsed.data.category,
        order: parsed.data.order ?? 0,
      },
    })

    return NextResponse.json(guide, { status: 201 })
  } catch (error) {
    console.error('Guide create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

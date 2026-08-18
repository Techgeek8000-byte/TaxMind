import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calculations = await db.taxCalculation.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    })

    // Strip raw input JSON from list response (may contain unvalidated fields)
    const sanitized = calculations.map(({ inputJson, ...rest }) => rest)
    return NextResponse.json(sanitized)
  } catch (error) {
    console.error('Tax calculations list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

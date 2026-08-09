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

    return NextResponse.json(calculations)
  } catch (error) {
    console.error('Tax calculations list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

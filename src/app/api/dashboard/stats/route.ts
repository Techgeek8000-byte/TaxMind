import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.userId

    const [totalCalculations, totalDocuments, taxAgg, recentCalculations] =
      await Promise.all([
        db.taxCalculation.count({ where: { userId } }),
        db.document.count({ where: { userId } }),
        db.taxCalculation.aggregate({
          where: { userId },
          _sum: { totalTax: true },
        }),
        db.taxCalculation.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])

    return NextResponse.json({
      totalCalculations,
      totalDocuments,
      totalTaxPaid: taxAgg._sum.totalTax ?? 0,
      recentCalculations,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

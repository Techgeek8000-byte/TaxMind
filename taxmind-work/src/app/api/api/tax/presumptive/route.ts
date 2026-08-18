import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  calculatePresumptiveTax,
  calculateTax,
} from '@/lib/tax-engine'
import { getSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

// ─── Schemas ────────────────────────────────────────────────────────────────

const presumptiveBodySchema = z.object({
  income: z.number().nonnegative('Income must be non-negative'),
  category: z.enum([
    'retailer',
    'wholesaler',
    'distributor',
    'service_provider',
    'rice_mill',
    'maize_mill',
    'cotton_mill',
    'commercial_import',
  ] as const, {
    message: 'Invalid category',
  }),
})

// ─── POST: Compare presumptive vs normal tax ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const body = await request.json()
    const parsed = presumptiveBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { income, category } = parsed.data

    // Calculate presumptive tax
    const presumptiveTax = calculatePresumptiveTax(income, category)

    // Calculate normal tax for comparison using business income head
    const normalTaxResult = calculateTax({
      incomeHead: 'business',
      taxYear: new Date().getFullYear().toString(),
      grossIncome: income,
    })
    const normalTax = normalTaxResult.totalTax

    const savings = normalTax - presumptiveTax
    const recommendation: 'presumptive' | 'normal' = savings > 0 ? 'presumptive' : 'normal'

    await logAudit({
      userId: session.userId,
      action: 'TAX_CALCULATE',
      resource: 'presumptive-tax',
      details: {
        income,
        category,
        presumptiveTax,
        normalTax,
        savings,
        recommendation,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        presumptiveTax,
        normalTax,
        savings,
        recommendation,
        category,
      },
    })
  } catch (error) {
    console.error('[POST /api/tax/presumptive]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

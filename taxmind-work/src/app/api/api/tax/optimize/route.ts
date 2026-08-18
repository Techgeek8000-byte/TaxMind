import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { computeSavingsScore, TAX_OPTIMIZATION_STRATEGIES, type TaxInput } from '@/lib/tax-engine'
import { getSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

// ─── Schemas ────────────────────────────────────────────────────────────────

const optimizeBodySchema = z.object({
  incomeHead: z.enum(['salary', 'business', 'property', 'capital_gains', 'other']),
  taxYear: z.string(),
  grossIncome: z.number().nonnegative(),
  sec60InvestmentPension: z.number().optional(),
  sec61LifeInsurance: z.number().optional(),
  sec62Zakat: z.number().optional(),
  sec63Education: z.number().optional(),
  sec64HealthInsurance: z.number().optional(),
  sec64ACharity: z.number().optional(),
  sec64BDomesticTravel: z.number().optional(),
  sec64CComputerIT: z.number().optional(),
  sec64DEmployerProvidentFund: z.number().optional(),
  sec64EEmployeeOldAge: z.number().optional(),
  isFemale: z.boolean().optional(),
  isSeniorCitizen: z.boolean().optional(),
  age: z.number().optional(),
  businessExpenses: z.number().optional(),
  propertyExpenses: z.number().optional(),
  propertyType: z.enum(['rent', 'capital_value']).optional(),
  holdingPeriodMonths: z.number().optional(),
  assetType: z.enum(['securities', 'immovable_property', 'other']).optional(),
  entityType: z.enum([
    'individual_salary',
    'individual_business',
    'aop',
    'company',
    'small_company',
    'banking_company',
  ]).optional(),
})

// ─── GET: Return all 22 optimization strategies ─────────────────────────────

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      strategies: TAX_OPTIMIZATION_STRATEGIES,
      count: TAX_OPTIMIZATION_STRATEGIES.length,
    })
  } catch (error) {
    console.error('[GET /api/tax/optimize]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch optimization strategies' },
      { status: 500 },
    )
  }
}

// ─── POST: Compute savings score for a given tax scenario ────────────────────

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
    const parsed = optimizeBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const taxInput: TaxInput = parsed.data
    const result = computeSavingsScore(taxInput)

    await logAudit({
      userId: session.userId,
      action: 'TAX_CALCULATE',
      resource: 'tax-optimize',
      details: {
        incomeHead: taxInput.incomeHead,
        grossIncome: taxInput.grossIncome,
        taxYear: taxInput.taxYear,
        savingsScore: result.score,
        totalPotentialSaving: result.totalPotentialSaving,
      },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[POST /api/tax/optimize]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

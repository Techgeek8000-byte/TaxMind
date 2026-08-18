import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateWealthStatement, type WealthStatementInput } from '@/lib/tax-engine'
import { getSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

// ─── Schemas ────────────────────────────────────────────────────────────────

const openingAssetsSchema = z.object({
  property: z.number(),
  bankBalance: z.number(),
  investments: z.number(),
  vehicles: z.number(),
  businessCapital: z.number(),
  otherAssets: z.number(),
  totalLiabilities: z.number(),
})

const declarationsSchema = z.object({
  income: z.number(),
  gifts: z.number(),
  loansReceived: z.number(),
  remittances: z.number(),
  otherDeclarations: z.number(),
})

const expendituresSchema = z.object({
  livingExpenses: z.number(),
  assetsPurchased: z.number(),
  loansRepaid: z.number(),
  taxesPaid: z.number(),
  otherExpenditures: z.number(),
})

const wealthStatementBodySchema = z.object({
  openingAssets: openingAssetsSchema,
  declarations: declarationsSchema,
  expenditures: expendituresSchema,
  ntn: z.string().optional(),
  name: z.string().optional(),
})

// ─── POST: Generate wealth statement reconciliation ──────────────────────────

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
    const parsed = wealthStatementBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { ntn, name, ...statementData } = parsed.data
    const wealthInput: WealthStatementInput = statementData

    const result = generateWealthStatement(wealthInput)

    await logAudit({
      userId: session.userId,
      action: 'TAX_CALCULATE',
      resource: 'wealth-statement',
      details: {
        ntn: ntn || undefined,
        name: name || undefined,
        openingWealth: result.openingWealth,
        closingWealth: result.closingWealth,
        isBalanced: result.isBalanced,
        difference: result.difference,
      },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[POST /api/tax/wealth-statement]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

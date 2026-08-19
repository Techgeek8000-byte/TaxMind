import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { calculateTax, type IncomeHead } from '@/lib/tax-engine'

const incomeHeadValues = ['salary', 'business', 'property', 'capital_gains', 'other'] as const

const taxCalculateSchema = z.object({
  incomeHead: z.enum(incomeHeadValues),
  taxYear: z.string().min(1),
  grossIncome: z.number().positive(),
  sec60InvestmentPension: z.number().min(0).optional(),
  sec61LifeInsurance: z.number().min(0).optional(),
  sec62Zakat: z.number().min(0).optional(),
  sec63Education: z.number().min(0).optional(),
  sec64HealthInsurance: z.number().min(0).optional(),
  sec64ACharity: z.number().min(0).optional(),
  sec64BDomesticTravel: z.number().min(0).optional(),
  sec64CComputerIT: z.number().min(0).optional(),
  sec64DEmployerProvidentFund: z.number().min(0).optional(),
  sec64EEmployeeOldAge: z.number().min(0).optional(),
  isFemale: z.boolean().optional(),
  isSeniorCitizen: z.boolean().optional(),
  age: z.number().optional(),
  businessExpenses: z.number().min(0).optional(),
  propertyExpenses: z.number().min(0).optional(),
  propertyType: z.enum(['rent', 'capital_value']).optional(),
  holdingPeriodMonths: z.number().optional(),
  assetType: z.enum(['securities', 'immovable_property', 'other']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = taxCalculateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data
    const result = calculateTax(input as Parameters<typeof calculateTax>[0])

    const calculation = await db.taxCalculation.create({
      data: {
        userId: session.userId,
        taxYear: input.taxYear,
        incomeHead: input.incomeHead,
        grossIncome: result.grossIncome,
        totalDeductions: result.totalDeductions,
        taxableIncome: result.taxableIncome,
        taxComputed: result.taxComputed,
        superTax: result.superTax,
        minimumTax: result.minimumTax,
        totalTax: result.totalTax,
        effectiveRate: result.effectiveRate,
        inputJson: parsed.data as unknown as Prisma.InputJsonValue,
      },
    })

    await logAudit({
      userId: session.userId,
      action: 'TAX_CALCULATE',
      resource: calculation.id,
      details: {
        taxYear: input.taxYear,
        incomeHead: input.incomeHead,
        grossIncome: input.grossIncome,
        totalTax: result.totalTax,
      },
    })

    return NextResponse.json({
      id: calculation.id,
      ...result,
    })
  } catch (error) {
    console.error('Tax calculate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

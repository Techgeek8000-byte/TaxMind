import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateIrisXML, type TaxResult } from '@/lib/tax-engine'
import { getSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

// ─── Schemas ────────────────────────────────────────────────────────────────

const taxpayerInfoSchema = z.object({
  ntn: z.string().min(1, 'NTN is required'),
  name: z.string().min(1, 'Name is required'),
  cnic: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

const irisXmlBodySchema = z.object({
  taxResult: z.object({
    grossIncome: z.number(),
    totalDeductions: z.number(),
    taxableIncome: z.number(),
    taxComputed: z.number(),
    superTax: z.number(),
    minimumTax: z.number(),
    totalTax: z.number(),
    effectiveRate: z.number(),
    breakdown: z.object({
      incomeHead: z.string(),
      slabs: z.array(z.object({
        slab: z.string(),
        rate: z.string(),
        amount: z.number(),
      })),
      deductions: z.array(z.object({
        section: z.string(),
        amount: z.number(),
      })),
    }),
  }),
  taxpayerInfo: taxpayerInfoSchema,
})

// ─── POST: Generate IRIS-compliant XML ───────────────────────────────────────

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
    const parsed = irisXmlBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { taxResult, taxpayerInfo } = parsed.data

    const xml = generateIrisXML(taxResult as TaxResult, {
      ntn: taxpayerInfo.ntn,
      name: taxpayerInfo.name,
      cnic: taxpayerInfo.cnic,
      incomeHead: 'salary',
      taxYear: new Date().getFullYear().toString(),
      grossIncome: taxResult.grossIncome,
    })

    const taxYear = new Date().getFullYear().toString()
    const filename = `IRIS_Return_${taxpayerInfo.ntn}_TY${taxYear}.xml`

    await logAudit({
      userId: session.userId,
      action: 'TAX_VIEW',
      resource: 'iris-xml',
      details: {
        ntn: taxpayerInfo.ntn,
        name: taxpayerInfo.name,
        filename,
        totalTax: taxResult.totalTax,
      },
    })

    return NextResponse.json({
      success: true,
      xml,
      filename,
    })
  } catch (error) {
    console.error('[POST /api/tax/iris-xml]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

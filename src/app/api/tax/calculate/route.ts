import { NextRequest, NextResponse } from 'next/server';
import { verifySession, createAuditLog } from '@/lib/auth';
import { calculateFullTax, generateFBRReturnData, type TaxCalculationInput } from '@/lib/tax-engine';
import { analyzeOptimizations } from '@/lib/tax-optimizations';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const input: TaxCalculationInput = await request.json();

    // Validate required fields
    if (!input.taxYear || !input.filingType) {
      return NextResponse.json({ error: 'Tax year and filing type are required' }, { status: 400 });
    }

    // Calculate tax
    const result = calculateFullTax(input);

    // Get optimization analysis
    const currentDeductions: { [key: string]: number } = {};
    if (input.deductions) {
      currentDeductions.zakat = input.deductions.zakat;
      currentDeductions.charityApproved = input.deductions.charityApproved;
      currentDeductions.pensionFund = input.deductions.pensionFund;
      currentDeductions.lifeInsurance = input.deductions.lifeInsurance;
      currentDeductions.educationFee = input.deductions.educationFee;
      currentDeductions.healthInsurance = input.deductions.healthInsurance;
      currentDeductions.investmentShares = input.deductions.investmentShares;
      currentDeductions.houseBuildingLoan = input.deductions.houseBuildingLoan;
      currentDeductions.itExportTaxCredit = input.deductions.itExportTaxCredit;
    }

    const optimization = analyzeOptimizations(
      result.taxableIncome,
      input.filingType,
      currentDeductions,
      result.grossIncome
    );

    // Generate FBR-compatible data
    const fbrData = generateFBRReturnData(result);

    // Save calculation to database
    const { db } = await import('@/lib/db');
    const calculation = await db.taxCalculation.create({
      data: {
        userId: session.id,
        taxYear: input.taxYear,
        filingType: input.filingType,
        salaryIncome: input.salary ? JSON.stringify(input.salary) : null,
        businessIncome: input.business ? JSON.stringify(input.business) : null,
        propertyIncome: input.property ? JSON.stringify(input.property) : null,
        capitalGains: input.capitalGains ? JSON.stringify(input.capitalGains) : null,
        otherIncome: input.otherIncome ? JSON.stringify(input.otherIncome) : null,
        allowedDeductions: input.deductions ? JSON.stringify(input.deductions) : null,
        grossIncome: result.grossIncome,
        taxableIncome: result.taxableIncome,
        taxComputed: result.taxPayable + result.taxCreditsApplied,
        taxCreditsApplied: result.taxCreditsApplied,
        taxPayable: result.taxPayable,
        taxAlreadyPaid: input.taxAlreadyPaid,
        taxDue: result.taxDue,
        optimizationStrategies: JSON.stringify(optimization),
        savingsAchieved: optimization.estimatedSavings,
        originalTax: optimization.originalTax,
        reportGenerated: false,
        status: 'completed',
      },
    });

    await createAuditLog(session.id, 'tax_calculate', {
      calculationId: calculation.id,
      taxYear: input.taxYear,
      taxDue: result.taxDue,
    });

    return NextResponse.json({
      message: 'Tax calculation completed',
      result,
      optimization,
      fbrData,
      calculationId: calculation.id,
    });
  } catch (error: any) {
    console.error('Tax calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed: ' + (error.message || 'Unknown error') }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await import('@/lib/db');
    const calculations = await db.taxCalculation.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        taxYear: true,
        filingType: true,
        grossIncome: true,
        taxableIncome: true,
        taxPayable: true,
        taxDue: true,
        savingsAchieved: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ calculations });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 });
  }
}

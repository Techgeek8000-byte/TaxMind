import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { OPTIMIZATION_STRATEGIES, analyzeOptimizations } from '@/lib/tax-optimizations';

export async function GET() {
  return NextResponse.json({ strategies: OPTIMIZATION_STRATEGIES });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { taxableIncome, filingType, currentDeductions, grossIncome } = await request.json();

    if (!taxableIncome || !filingType) {
      return NextResponse.json({ error: 'Taxable income and filing type required' }, { status: 400 });
    }

    const result = analyzeOptimizations(
      taxableIncome,
      filingType,
      currentDeductions || {},
      grossIncome || taxableIncome
    );

    return NextResponse.json({ optimization: result });
  } catch (error: any) {
    return NextResponse.json({ error: 'Optimization analysis failed' }, { status: 500 });
  }
}
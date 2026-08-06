import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    const session = await verifySession(token || '');
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await import('@/lib/db');
    const logs = await db.auditLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

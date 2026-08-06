import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
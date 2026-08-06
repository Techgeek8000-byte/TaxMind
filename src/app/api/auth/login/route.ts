import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await loginUser(email, password, ipAddress, userAgent);

    const response = NextResponse.json({
      message: 'Login successful',
      ...result,
    });

    response.cookies.set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    const status = error.code === 'INVALID_CREDENTIALS' ? 401 
      : error.code === 'ACCOUNT_LOCKED' ? 423 
      : error.code === 'ACCOUNT_DISABLED' ? 403 
      : 500;
    
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, company } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    const user = await registerUser(email, name, password, company);
    return NextResponse.json({ message: 'Registration successful', user }, { status: 201 });
  } catch (error: any) {
    const status = error.code === 'USER_EXISTS' ? 409 : error.code === 'WEAK_PASSWORD' ? 400 : 500;
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status }
    );
  }
}

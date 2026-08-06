import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // If there's a 'code' parameter, this is the OAuth callback
  if (searchParams.get('code')) {
    return handleCallback(request);
  }

  // Otherwise, initiate OAuth flow
  return initiateOAuth();
}

function initiateOAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/google`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID environment variable.' },
      { status: 501 }
    );
  }

  const scope = 'openid email profile';
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=select_account`;

  return NextResponse.json({ url });
}

async function handleCallback(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?auth=error', request.url));
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/google`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?auth=no_google_config', request.url));
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token error:', err);
      return NextResponse.redirect(new URL('/?auth=token_error', request.url));
    }

    const { access_token } = await tokenRes.json() as { access_token: string };

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/?auth=userinfo_error', request.url));
    }

    const googleUser = await userRes.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
      verified_email: boolean;
    };

    if (!googleUser.verified_email) {
      return NextResponse.redirect(new URL('/?auth=email_not_verified', request.url));
    }

    // Upsert user in database
    let user = await db.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      // Update existing user's Google info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.id,
          avatar: googleUser.picture || user.avatar || null,
          lastLogin: new Date(),
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
    } else {
      // Create new user from Google
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          avatar: googleUser.picture || null,
          passwordHash: '', // OAuth users don't have passwords
        },
      });
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'google_login',
        details: JSON.stringify({ provider: 'google', email: googleUser.email, timestamp: new Date().toISOString() }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Create session token
    const sessionToken = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000,
        iat: Date.now(),
      })
    ).toString('base64');

    // Redirect to frontend with token in cookie
    const frontendUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(`${frontendUrl}/?auth=success&token=${sessionToken}`);

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use 'lax' for OAuth redirects
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?auth=server_error', request.url));
  }
}

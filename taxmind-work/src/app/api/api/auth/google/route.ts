import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { createToken, setSessionCookie } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

// Google's public keys URL (cached JWK set)
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'

interface GooglePayload {
  email: string
  name?: string
  picture?: string
  sub: string
  iss: string
  aud: string
  exp: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json(
        { error: 'Google ID token is required' },
        { status: 400 }
      )
    }

    let payload: GooglePayload
    // Verify the Google JWT — NEVER fall back to unverified decoding
    const { createRemoteJWKSet } = await import('jose')
    const jwtKey = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL))

    const { payload: decoded } = await jwtVerify(idToken, jwtKey, {
      audience: process.env.GOOGLE_CLIENT_ID,
      issuer: 'accounts.google.com',
    })

    payload = decoded as unknown as GooglePayload

    const email = payload.email.toLowerCase()
    const name = payload.name || null
    const avatar = payload.picture || null
    const googleId = payload.sub

    if (!email) {
      return NextResponse.json(
        { error: 'Could not extract email from Google token' },
        { status: 400 }
      )
    }

    // Find or create user by email
    let user = await db.user.findUnique({
      where: { email },
    })

    if (user) {
      // Security: Only auto-link Google if the user has no password (Google-created account)
      // Users with existing passwords must link Google from account settings to prevent takeover
      if (user.passwordHash && !user.googleId) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in with your password, then link Google from account settings.' },
          { status: 409 },
        )
      }
      // Update existing Google-linked user
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId,
          ...(avatar ? { avatar } : {}),
          ...(name ? { name } : {}),
        },
      })
    } else {
      // Create new user via Google
      user = await db.user.create({
        data: {
          email,
          googleId,
          name,
          avatar,
        },
      })
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    })

    // Set session cookie
    await setSessionCookie(token)

    // Log audit
    await logAudit({
      userId: user.id,
      action: 'AUTH_GOOGLE',
      resource: 'User',
      details: { email: user.email, method: 'google' },
    })

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

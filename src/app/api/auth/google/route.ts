import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, setSessionCookie } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, email, name, avatar } = body

    if (!idToken || !email) {
      return NextResponse.json(
        { error: 'idToken and email are required' },
        { status: 400 }
      )
    }

    // Find or create user by email + googleId
    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (user) {
      // Existing user — link Google ID if not already set
      if (!user.googleId) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: idToken,
            avatar: avatar || user.avatar,
            name: name || user.name,
          },
        })
      } else {
        // Update avatar/name if provided
        user = await db.user.update({
          where: { id: user.id },
          data: {
            ...(avatar ? { avatar } : {}),
            ...(name ? { name } : {}),
          },
        })
      }
    } else {
      // Create new user via Google
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          googleId: idToken,
          name: name || null,
          avatar: avatar || null,
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

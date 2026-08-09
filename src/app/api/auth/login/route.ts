import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  getSession,
  createToken,
  setSessionCookie,
  verifyPassword,
  LOCKOUT_THRESHOLD,
  LOCKOUT_DURATION_MS,
} from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is locked
    if (user.isLocked && user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now()
      const remainingMin = Math.ceil(remainingMs / 60000)
      return NextResponse.json(
        {
          error: `Account is locked due to too many failed login attempts. Try again in ${remainingMin} minute(s).`,
          lockedUntil: user.lockedUntil,
        },
        { status: 423 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      // Increment failed attempts
      const newFailedAttempts = user.failedAttempts + 1
      const shouldLock = newFailedAttempts >= LOCKOUT_THRESHOLD
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null

      await db.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newFailedAttempts,
          isLocked: shouldLock,
          lockedUntil,
        },
      })

      if (shouldLock) {
        await logAudit({
          userId: user.id,
          action: 'AUTH_LOGIN',
          resource: 'User',
          details: {
            success: false,
            reason: 'Account locked after too many failed attempts',
            failedAttempts: newFailedAttempts,
          },
        })
      }

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Login successful — reset lockout fields
    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
      },
    })

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
      action: 'AUTH_LOGIN',
      resource: 'User',
      details: { success: true, method: 'email' },
    })

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

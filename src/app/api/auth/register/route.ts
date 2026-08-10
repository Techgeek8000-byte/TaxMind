import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  createToken,
  setSessionCookie,
  hashPassword,
} from '@/lib/auth'
import { logAudit } from '@/lib/audit'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with zod
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Unable to create account. Please try again or contact support.' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
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
      action: 'AUTH_REGISTER',
      resource: 'User',
      details: { email: user.email },
    })

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword, message: 'Registration successful' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

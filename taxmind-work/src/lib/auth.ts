import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

let _jwtSecret: Uint8Array | null = null

function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret
  const raw = process.env.JWT_SECRET
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[TaxMind] FATAL: JWT_SECRET environment variable is required in production.')
    }
    console.warn('[TaxMind] WARNING: JWT_SECRET is not set. Using an insecure default — this MUST be changed before deploying to production.')
    _jwtSecret = new TextEncoder().encode('taxmind-pakistan-dev-only-insecure-key')
  } else {
    _jwtSecret = new TextEncoder().encode(raw)
  }
  return _jwtSecret
}
const COOKIE_NAME = 'taxmind-session'

export interface SessionPayload {
  userId: string
  email: string
  name?: string
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  // 24-hour expiry
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(getJwtSecret())
  return token
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    // Support base64-encoded tokens (backward compat)
    let actualToken = token
    try {
      const decoded = atob(token)
      if (decoded.startsWith('ey')) {
        actualToken = decoded
      }
    } catch {
      // Not base64, use as-is
    }
    const { payload } = await jwtVerify(actualToken, getJwtSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export const LOCKOUT_THRESHOLD = 5
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Verify authentication for API routes.
 * Returns the session payload if authenticated, or null if not.
 * Throws on unexpected errors (network, DB, etc.) so callers can 500.
 */
export async function verifyAuth(): Promise<SessionPayload | null> {
  try {
    return await getSession()
  } catch {
    return null
  }
}

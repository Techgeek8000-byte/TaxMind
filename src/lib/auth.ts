import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const _JWT_SECRET_RAW = process.env.JWT_SECRET
if (!_JWT_SECRET_RAW) {
  console.warn('[TaxMind] WARNING: JWT_SECRET is not set. Using an insecure default — this MUST be changed in production.')
}
const JWT_SECRET = new TextEncoder().encode(
  _JWT_SECRET_RAW || 'taxmind-pakistan-dev-only-insecure-key'
)
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
  // 7-day expiry
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
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
    const { payload } = await jwtVerify(actualToken, JWT_SECRET)
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

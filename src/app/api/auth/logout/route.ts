import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession, clearSessionCookie } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

const COOKIE_NAME = 'taxmind-session'

/**
 * Server-side cookie clearing that properly awaits the async cookies() API.
 * The shared clearSessionCookie in auth.ts calls cookies() synchronously,
 * which doesn't work correctly in route handlers where it must be awaited.
 */
async function serverClearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function POST() {
  try {
    // Try to get session for audit logging (best-effort)
    let userId: string | undefined
    try {
      const session = await getSession()
      if (session) {
        userId = session.userId
      }
    } catch {
      // Session may be invalid/expired — that's fine, still clear cookie
    }

    // Clear the session cookie
    await serverClearSession()

    // Log audit
    if (userId) {
      await logAudit({
        userId,
        action: 'AUTH_LOGOUT',
        resource: 'User',
      })
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getSession, clearSessionCookie } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST() {
  try {
    let userId: string | undefined
    try {
      const session = await getSession()
      if (session) {
        userId = session.userId
      }
    } catch {
      // Session may be invalid/expired — that's fine, still clear cookie
    }

    await clearSessionCookie()

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

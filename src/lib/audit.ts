import { db } from './db'
import { Prisma } from '@prisma/client'

type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_REGISTER'
  | 'AUTH_GOOGLE'
  | 'AUTH_LOGOUT'
  | 'TAX_CALCULATE'
  | 'TAX_VIEW'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_SCAN'
  | 'GUIDE_VIEW'
  | 'DASHBOARD_VIEW'
  | 'PROFILE_UPDATE'

export async function logAudit(params: {
  userId?: string
  action: AuditAction
  resource?: string
  details?: Record<string, unknown>
}) {
  try {
    const headersList = await import('next/headers').then(m => m.headers())
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const ua = headersList.get('user-agent') || 'unknown'

    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        details: (params.details || undefined) as Prisma.InputJsonValue,
        ipAddress: ip,
        userAgent: ua,
      },
    })
  } catch (e) {
    console.error('Audit log failed:', e)
  }
}

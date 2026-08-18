'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/app'

interface AuditEntry {
  id: string
  action: string
  resource?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  AUTH_LOGIN: 'bg-emerald-500/20 text-emerald-300',
  AUTH_REGISTER: 'bg-blue-500/20 text-blue-300',
  AUTH_GOOGLE: 'bg-violet-500/20 text-violet-300',
  AUTH_LOGOUT: 'bg-gray-500/20 text-gray-300',
  TAX_CALCULATE: 'bg-amber-500/20 text-amber-300',
  TAX_VIEW: 'bg-amber-500/10 text-amber-400',
  DOCUMENT_UPLOAD: 'bg-cyan-500/20 text-cyan-300',
  DOCUMENT_SCAN: 'bg-teal-500/20 text-teal-300',
  GUIDE_VIEW: 'bg-indigo-500/20 text-indigo-300',
  DASHBOARD_VIEW: 'bg-gray-500/10 text-gray-400',
  PROFILE_UPDATE: 'bg-pink-500/20 text-pink-300',
}

export default function AuditLog() {
  const { setView } = useAppStore()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function fetchLogs() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/audit')
      if (!res.ok) throw new Error('Failed to fetch audit logs')
      const data = await res.json()
      setLogs(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-PK', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Audit Log
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Complete history of your account activity</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={fetchLogs}>Retry</Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No activity recorded yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <Badge
                        variant="secondary"
                        className={`shrink-0 text-xs ${ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-300'}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        {log.resource && (
                          <p className="text-sm font-medium">{log.resource}</p>
                        )}
                        {log.details && typeof log.details === 'object' && (
                          <p className="text-xs text-muted-foreground truncate">
                            {Object.entries(log.details)
                              .slice(0, 3)
                              .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
                              .join(' | ')}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.ipAddress && <span>IP: {log.ipAddress} · </span>}
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

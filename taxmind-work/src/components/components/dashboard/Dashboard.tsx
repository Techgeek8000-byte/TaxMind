'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Upload,
  BookOpen,
  BarChart3,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app'

// ─── Types ─────────────────────────────────────────────────────
interface DashboardStats {
  totalCalculations: number
  totalDocuments: number
  totalTaxPaid: number
  recentCalculations: RecentCalculation[]
  securityStatus: {
    isLocked: boolean
    failedAttempts: number
  }
}

interface RecentCalculation {
  id: string
  taxYear: string
  incomeHead: string
  grossIncome: number
  totalTax: number
  effectiveRate: number
  createdAt: string
}

interface UserInfo {
  id: string
  email: string
  name?: string
}

// ─── Animation Variants ────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ─── Helpers ───────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function incomeHeadLabel(head: string): string {
  const map: Record<string, string> = {
    salary: 'Salary',
    business: 'Business',
    property: 'Property',
    capital_gains: 'Capital Gains',
    other: 'Other',
  }
  return map[head] || head
}

function incomeHeadColor(head: string): string {
  const map: Record<string, string> = {
    salary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    business: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    property: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    capital_gains: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    other: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
  }
  return map[head] || map.other
}

// ─── Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const setView = useAppStore((s) => s.setView)
  const storeUser = useAppStore((s) => s.user)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, meRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/auth/me'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (meRes.ok) {
        const meData = await meRes.json()
        setUser(meData.user)
      } else if (statsRes.status === 401 || meRes.status === 401) {
        setView('login')
        return
      }
    } catch {
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [setView])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const displayName = user?.name || storeUser?.name || 'User'
  const greeting = getGreeting()

  return (
    <div className="app-shell-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Welcome Header ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s an overview of your tax activity on TaxMind Pakistan.
          </p>
        </motion.div>

        {error ? (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" onClick={fetchData}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6"
          >
            {/* ─── Stat Cards ──────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="glass-card p-6">
                      <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </Card>
                  ))
                : (
                    <>
                      <StatCard
                        icon={<Calculator className="h-5 w-5" />}
                        iconBg="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        label="Total Calculations"
                        value={stats?.totalCalculations ?? 0}
                        variant="number"
                      />
                      <StatCard
                        icon={<FileText className="h-5 w-5" />}
                        iconBg="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                        label="Documents Uploaded"
                        value={stats?.totalDocuments ?? 0}
                        variant="number"
                      />
                      <StatCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        iconBg="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        label="Total Tax Computed"
                        value={stats?.totalTaxPaid ?? 0}
                        variant="currency"
                      />
                      <StatCard
                        icon={
                          stats?.securityStatus.isLocked ? (
                            <ShieldAlert className="h-5 w-5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5" />
                          )
                        }
                        iconBg={
                          stats?.securityStatus.isLocked
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                        }
                        label="Account Security"
                        value={
                          stats?.securityStatus?.isLocked
                            ? 'Locked'
                            : (stats?.securityStatus?.failedAttempts ?? 0) > 0
                              ? `${stats!.securityStatus!.failedAttempts} failed attempt(s)`
                              : 'Secure'
                        }
                        variant="text"
                      />
                    </>
                  )}
            </div>

            {/* ─── Recent Calculations & Security ──────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Calculations Table */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Recent Calculations</CardTitle>
                        <CardDescription>Your last 5 tax computations</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('reports')}
                        className="text-primary"
                      >
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : !stats?.recentCalculations.length ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="text-sm font-medium text-muted-foreground">No calculations yet</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">
                          Start by performing your first tax calculation.
                        </p>
                        <Button
                          size="sm"
                          className="mt-4"
                          onClick={() => setView('calculator')}
                        >
                          <Calculator className="mr-2 h-4 w-4" />
                          New Calculation
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Tax Year</TableHead>
                              <TableHead>Income Head</TableHead>
                              <TableHead className="text-right">Gross Income</TableHead>
                              <TableHead className="text-right">Tax</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.recentCalculations.map((calc) => (
                              <TableRow key={calc.id} className="even:bg-muted/30 hover:bg-primary/5 transition-colors">
                                <TableCell className="py-3 px-4 text-xs text-muted-foreground">
                                  {formatDate(calc.createdAt)}
                                </TableCell>
                                <TableCell className="py-3 px-4 font-medium">
                                  {calc.taxYear}
                                </TableCell>
                                <TableCell className="py-3 px-4">
                                  <Badge
                                    variant="secondary"
                                    className={incomeHeadColor(calc.incomeHead)}
                                  >
                                    {incomeHeadLabel(calc.incomeHead)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3 px-4 text-right font-mono text-sm">
                                  {formatCurrency(calc.grossIncome)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-right font-mono text-sm font-medium">
                                  {formatCurrency(calc.totalTax)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-right text-sm">
                                  {calc.effectiveRate.toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security Status Card */}
              <motion.div variants={itemVariants}>
                <Card className="glass-card relative h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-lg">Security Status</CardTitle>
                    <CardDescription>Your account protection overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                          {stats?.securityStatus.isLocked ? (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {stats?.securityStatus.isLocked ? 'Account Locked' : 'Account Active'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stats?.securityStatus.isLocked
                                ? 'Too many failed login attempts.'
                                : 'No security issues detected.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Failed Login Attempts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stats?.securityStatus.failedAttempts ?? 0} failed attempt(s) recorded.
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Security Tips
                          </p>
                          <ul className="space-y-1.5 text-xs text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              Use a strong, unique password
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              Never share your login credentials
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              Enable 2FA when available
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── Quick Actions ────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Get started with these common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickAction
                      icon={<Calculator className="h-5 w-5" />}
                      label="New Calculation"
                      description="Compute your income tax"
                      onClick={() => setView('calculator')}
                      primary
                    />
                    <QuickAction
                      icon={<Upload className="h-5 w-5" />}
                      label="Upload Document"
                      description="Scan salary slips or tax forms"
                      onClick={() => setView('scanner')}
                    />
                    <QuickAction
                      icon={<BookOpen className="h-5 w-5" />}
                      label="View Guides"
                      description="FBR rules & tax slabs"
                      onClick={() => setView('guides')}
                    />
                    <QuickAction
                      icon={<BarChart3 className="h-5 w-5" />}
                      label="View Reports"
                      description="Past calculations & summaries"
                      onClick={() => setView('reports')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number | string
  variant: 'number' | 'currency' | 'text'
}) {
  const displayValue =
    variant === 'currency'
      ? formatCurrency(value as number)
      : variant === 'number'
        ? String(value)
        : (value as string)

  return (
    <Card className="glass-card p-4 transition-slow hover:shadow-emerald-lg hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={`mt-1 truncate font-semibold ${
              variant === 'text' && (value as string) === 'Locked'
                ? 'text-destructive'
                : 'text-foreground'
            }`}
          >
            {displayValue}
          </p>
        </div>
      </div>
    </Card>
  )
}

function QuickAction({
  icon,
  label,
  description,
  onClick,
  primary,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-slow hover:scale-[1.02] hover:shadow-emerald-lg hover:backdrop-blur-xl ${
        primary
          ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-muted/80'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          primary
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

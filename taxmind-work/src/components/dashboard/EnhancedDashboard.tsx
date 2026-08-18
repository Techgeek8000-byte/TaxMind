'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Calculator,
  FileText,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  BarChart3,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CalendarClock,
  PieChartIcon,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ScanLine,
  Bot,
  CalendarDays,
  Target,
  Landmark,
  Zap,
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
import { useAppStore } from '@/store/app'

// ─── Animated Counter Hook ───────────────────────────────────────
const useAnimatedCounter = (end: number, duration = 1500) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime: number
    let raf: number
    const animate = (time: number) => {
      if (!startTime) startTime = time
      const progress = Math.min((time - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [end, duration])
  return count
}

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
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  effectiveRate: number
  createdAt: string
  inputJson: Record<string, unknown>
}

interface UserInfo {
  id: string
  email: string
  name?: string
}

interface TaxCalendarEvent {
  day: number
  month: number
  title: string
  type: 'filing' | 'payment' | 'statement'
  description: string
}

// ─── Constants ─────────────────────────────────────────────────
const INCOME_HEAD_COLORS: Record<string, string> = {
  salary: '#10b981',
  business: '#14b8a6',
  property: '#f59e0b',
  capital_gains: '#f43f5e',
  other: '#8b5cf6',
}

const INCOME_HEAD_LABELS: Record<string, string> = {
  salary: 'Salary',
  business: 'Business',
  property: 'Property',
  capital_gains: 'Capital Gains',
  other: 'Other',
}

const INCOME_HEAD_BADGE: Record<string, string> = {
  salary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  business: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  property: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  capital_gains: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  other: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
}

const DEDUCTION_SECTION_MAP: Record<string, { label: string; maxPct: number }> = {
  sec60InvestmentPension: { label: 'Sec 60 – Pension', maxPct: 20 },
  sec61LifeInsurance: { label: 'Sec 61 – Insurance', maxPct: 20 },
  sec62Zakat: { label: 'Sec 62 – Zakat', maxPct: 100 },
  sec63Education: { label: 'Sec 63 – Education', maxPct: 5 },
  sec64HealthInsurance: { label: 'Sec 64 – Health Ins.', maxPct: 5 },
  sec64ACharity: { label: 'Sec 64A – Charity', maxPct: 30 },
  sec64BDomesticTravel: { label: 'Sec 64B – Travel', maxPct: 2 },
  sec64CComputerIT: { label: 'Sec 64C – IT Equip', maxPct: 3 },
}

// Tax calendar events for the current tax year (Jul 2024 – Jun 2025)
const TAX_CALENDAR_EVENTS: TaxCalendarEvent[] = [
  { day: 1, month: 7, title: 'Tax Year Begins', type: 'statement', description: 'TY 2024-2025 starts' },
  { day: 15, month: 7, title: 'Q1 Advance Tax', type: 'payment', description: 'First quarterly advance tax payment (Sec 147)' },
  { day: 30, month: 7, title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return due' },
  { day: 31, month: 8, title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return due' },
  { day: 30, month: 9, title: 'Q1 Return Filing', type: 'filing', description: 'Quarterly return filing deadline' },
  { day: 1, month: 10, title: 'Quarterly Statement', type: 'statement', description: 'Quarterly wealth statement' },
  { day: 31, month: 10, title: 'Annual Return', type: 'filing', description: 'Annual return deadline (extended from Sep 30)' },
  { day: 30, month: 11, title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return due' },
  { day: 31, month: 12, title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return due' },
  { day: 15, month: 12, title: 'Q2 Advance Tax', type: 'payment', description: 'Second quarterly advance tax payment (Sec 147)' },
  { day: 31, month: 12, title: 'Wealth Statement', type: 'statement', description: 'Annual wealth statement deadline (Sec 116)' },
  { day: 15, month: 3, title: 'Q3 Advance Tax', type: 'payment', description: 'Third quarterly advance tax payment (Sec 147)' },
  { day: 31, month: 3, title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return due' },
  { day: 15, month: 6, title: 'Q4 Advance Tax', type: 'payment', description: 'Fourth quarterly advance tax payment (Sec 147)' },
  { day: 30, month: 6, title: 'Year-End', type: 'statement', description: 'Tax year ends — filing & payments close' },
]

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

function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function incomeHeadLabel(head: string): string {
  return INCOME_HEAD_LABELS[head] || head
}

function incomeHeadColor(head: string): string {
  return INCOME_HEAD_BADGE[head] || 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300'
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getMonthName(month: number): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return months[month - 1] || ''
}

// ─── Component ─────────────────────────────────────────────────
export default function EnhancedDashboard() {
  const setView = useAppStore((s) => s.setView)
  const storeUser = useAppStore((s) => s.user)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [allCalculations, setAllCalculations] = useState<RecentCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, meRes, calcRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/auth/me'),
        fetch('/api/tax/calculations'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (calcRes.ok) {
        const calcData = await calcRes.json()
        setAllCalculations(Array.isArray(calcData) ? calcData : [])
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

  // ─── Animated counter values using the new hook ─────────────
  const animatedCalculations = useAnimatedCounter(loading ? 0 : (stats?.totalCalculations ?? 0), 1500)
  const animatedDocuments = useAnimatedCounter(loading ? 0 : (stats?.totalDocuments ?? 0), 1500)
  const animatedTaxPaid = useAnimatedCounter(loading ? 0 : (stats?.totalTaxPaid ?? 0), 1500)

  // ─── Last 5 calculations from /api/tax/calculations ────────
  const recentFive = useMemo(() => {
    return allCalculations.slice(0, 5)
  }, [allCalculations])

  // ─── Chart data derivations ──────────────────────────────────
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const calc of allCalculations) {
      const head = calc.incomeHead
      grouped[head] = (grouped[head] || 0) + calc.grossIncome
    }
    return Object.entries(grouped).map(([head, value]) => ({
      name: INCOME_HEAD_LABELS[head] || head,
      value,
      head,
      fill: INCOME_HEAD_COLORS[head] || '#8b5cf6',
    }))
  }, [allCalculations])

  const monthlyTrendData = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const calc of allCalculations) {
      const d = new Date(calc.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      grouped[key] = (grouped[key] || 0) + calc.totalTax
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, tax]) => ({ month, tax }))
  }, [allCalculations])

  const deductionData = useMemo(() => {
    const utilization: Record<string, { claimed: number; maxPct: number; label: string; taxableIncome: number }> = {}

    for (const calc of allCalculations) {
      const inp = calc.inputJson as Record<string, number | undefined> | undefined
      if (!inp) continue

      const taxableIncome = calc.taxableIncome || 0

      for (const [key, sectionInfo] of Object.entries(DEDUCTION_SECTION_MAP)) {
        const val = inp[key]
        if (val && val > 0) {
          if (!utilization[key]) {
            utilization[key] = {
              claimed: 0,
              maxPct: sectionInfo.maxPct,
              label: sectionInfo.label,
              taxableIncome,
            }
          }
          utilization[key].claimed += val
          if (taxableIncome > utilization[key].taxableIncome) {
            utilization[key].taxableIncome = taxableIncome
          }
        }
      }
    }

    return Object.values(utilization).map((u) => {
      const maxAllowed = u.maxPct === 100 ? Infinity : u.taxableIncome * (u.maxPct / 100)
      const pct = maxAllowed === Infinity ? (u.claimed > 0 ? 100 : 0) : Math.min(100, (u.claimed / maxAllowed) * 100)
      return {
        section: u.label,
        utilized: Math.round(pct),
        claimed: u.claimed,
        fill: pct >= 90 ? '#10b981' : pct >= 50 ? '#14b8a6' : pct > 0 ? '#f59e0b' : '#e5e7eb',
      }
    })
  }, [allCalculations])

  // ─── Tax calendar for current month ──────────────────────────
  const currentMonthEvents = useMemo(() => {
    const now = new Date()
    const cm = now.getMonth() + 1
    const cd = now.getDate()
    return TAX_CALENDAR_EVENTS
      .filter((e) => e.month === cm)
      .map((e) => ({
        ...e,
        status: cd > e.day ? 'overdue' as const : cd === e.day ? 'due' as const : 'upcoming' as const,
      }))
      .sort((a, b) => a.day - b.day)
  }, [])

  const displayName = user?.name || storeUser?.name || 'User'
  const greeting = getGreeting()

  // ─── Custom tooltip for recharts ─────────────────────────────
  const currencyTooltip = (props: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    const { active, payload, label } = props as { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
        {label && <p className="mb-1 font-medium text-muted-foreground">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="font-mono text-foreground">
            {p.name}: {formatPKR(p.value)}
          </p>
        ))}
      </div>
    )
  }

  const pctTooltip = (props: { active?: boolean; payload?: Array<{ value: number; payload: { section: string; claimed: number } }> }) => {
    const { active, payload } = props as { active?: boolean; payload?: Array<{ value: number; payload: { section: string; claimed: number } }> }
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
        <p className="font-medium">{d.payload.section}</p>
        <p className="font-mono">{d.value}% utilized</p>
        <p className="text-muted-foreground">{formatPKR(d.payload.claimed)} claimed</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
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
            {/* ─── Stat Cards with Animated Counters ──────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </Card>
                  ))
                : (
                    <>
                      <AnimatedStatCard
                        icon={<Calculator className="h-5 w-5" />}
                        iconBg="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        label="Total Calculations"
                        targetValue={stats?.totalCalculations ?? 0}
                        animatedValue={animatedCalculations}
                        variant="number"
                      />
                      <AnimatedStatCard
                        icon={<FileText className="h-5 w-5" />}
                        iconBg="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                        label="Documents Uploaded"
                        targetValue={stats?.totalDocuments ?? 0}
                        animatedValue={animatedDocuments}
                        variant="number"
                      />
                      <AnimatedStatCard
                        icon={<TrendingUp className="h-5 w-5" />}
                        iconBg="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        label="Total Tax Computed"
                        targetValue={stats?.totalTaxPaid ?? 0}
                        animatedValue={animatedTaxPaid}
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
                          stats?.securityStatus.isLocked
                            ? 'Locked'
                            : (stats?.securityStatus.failedAttempts ?? 0) > 0
                              ? `${stats!.securityStatus.failedAttempts} failed attempt(s)`
                              : 'Secure'
                        }
                        variant="text"
                      />
                    </>
                  )}
            </div>

            {/* ─── Charts Row: Pie + Area + Bar ──────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Income Breakdown Pie Chart */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <PieChartIcon className="h-4 w-4 text-emerald-600" />
                      Income Breakdown
                    </CardTitle>
                    <CardDescription>Distribution by income head</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[220px] w-full rounded-lg" />
                    ) : pieData.length === 0 ? (
                      <div className="flex h-[220px] items-center justify-center text-center">
                        <div>
                          <PieChartIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={0}
                            >
                              {pieData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                const d = payload[0]
                                return (
                                  <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                                    <p className="font-medium">{d.name}</p>
                                    <p className="font-mono">{formatPKR(d.value as number)}</p>
                                  </div>
                                )
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value: string) => (
                                <span className="text-xs text-muted-foreground">{value}</span>
                              )}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Tax Trend Area Chart */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-4 w-4 text-teal-600" />
                      Monthly Tax Trend
                    </CardTitle>
                    <CardDescription>Tax amounts over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[220px] w-full rounded-lg" />
                    ) : monthlyTrendData.length === 0 ? (
                      <div className="flex h-[220px] items-center justify-center text-center">
                        <div>
                          <Activity className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyTrendData}>
                            <defs>
                              <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v: string) => {
                                const [, m] = v.split('-')
                                return getMonthName(parseInt(m, 10))
                              }}
                            />
                            <YAxis
                              tick={{ fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v: number) =>
                                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                              }
                            />
                            <Tooltip content={currencyTooltip as never} />
                            <Area
                              type="monotone"
                              dataKey="tax"
                              name="Tax"
                              stroke="#14b8a6"
                              strokeWidth={2}
                              fill="url(#taxGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Deduction Utilization Bar Chart */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-4 w-4 text-amber-600" />
                      Deduction Utilization
                    </CardTitle>
                    <CardDescription>% of allowed limits used</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-[220px] w-full rounded-lg" />
                    ) : deductionData.length === 0 ? (
                      <div className="flex h-[220px] items-center justify-center text-center">
                        <div>
                          <BarChart3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground">No deductions claimed yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={deductionData} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" horizontal={false} />
                            <XAxis
                              type="number"
                              domain={[0, 100]}
                              tick={{ fontSize: 10 }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(v: number) => `${v}%`}
                            />
                            <YAxis
                              type="category"
                              dataKey="section"
                              tick={{ fontSize: 9 }}
                              tickLine={false}
                              axisLine={false}
                              width={80}
                            />
                            <Tooltip content={pctTooltip as never} />
                            <Bar dataKey="utilized" radius={[0, 4, 4, 0]} maxBarSize={16}>
                              {deductionData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── Quick Actions Section (2x3 grid of 6 buttons) ── */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Jump to your most-used tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <QuickActionButton
                      icon={<Calculator className="h-5 w-5" />}
                      label="Calculator"
                      color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                      onClick={() => useAppStore.getState().setView('calculator')}
                    />
                    <QuickActionButton
                      icon={<ScanLine className="h-5 w-5" />}
                      label="Scanner"
                      color="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/60"
                      onClick={() => useAppStore.getState().setView('scanner')}
                    />
                    <QuickActionButton
                      icon={<Bot className="h-5 w-5" />}
                      label="AI Chat"
                      color="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/60"
                      onClick={() => useAppStore.getState().setView('ai-chat')}
                    />
                    <QuickActionButton
                      icon={<CalendarDays className="h-5 w-5" />}
                      label="Calendar"
                      color="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                      onClick={() => useAppStore.getState().setView('tax-calendar')}
                    />
                    <QuickActionButton
                      icon={<Target className="h-5 w-5" />}
                      label="Savings"
                      color="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                      onClick={() => useAppStore.getState().setView('savings-score')}
                    />
                    <QuickActionButton
                      icon={<Landmark className="h-5 w-5" />}
                      label="Wealth"
                      color="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/60"
                      onClick={() => useAppStore.getState().setView('wealth-statement')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Recent Calculations (last 5 from API) & Tax Calendar ── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Calculations Table */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Clock className="h-4 w-4 text-teal-600" />
                          Recent Calculations
                        </CardTitle>
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
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : recentFive.length === 0 ? (
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
                            {recentFive.map((calc) => (
                              <TableRow key={calc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setView('reports')}>
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatDate(calc.createdAt)}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {calc.taxYear}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={incomeHeadColor(calc.incomeHead)}
                                  >
                                    {incomeHeadLabel(calc.incomeHead)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {formatCurrency(calc.grossIncome)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm font-medium text-primary">
                                  {formatCurrency(calc.totalTax)}
                                </TableCell>
                                <TableCell className="text-right text-sm">
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

              {/* Tax Calendar Widget */}
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CalendarClock className="h-4 w-4 text-emerald-600" />
                      Tax Calendar
                    </CardTitle>
                    <CardDescription>FBR deadlines this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : currentMonthEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarClock className="mb-2 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No tax events this month</p>
                      </div>
                    ) : (
                      <div className="max-h-72 space-y-2 overflow-y-auto">
                        {currentMonthEvents.map((event, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                              {event.day}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-tight">{event.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                {event.description}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                event.status === 'overdue'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                  : event.status === 'due'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              }
                            >
                              {event.status === 'overdue' ? (
                                <><AlertCircle className="mr-1 h-3 w-3" /> Overdue</>
                              ) : event.status === 'due' ? (
                                <><Clock className="mr-1 h-3 w-3" /> Due</>
                              ) : (
                                <><CheckCircle2 className="mr-1 h-3 w-3" /> Upcoming</>
                              )}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ─── Security Status ──────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Status</CardTitle>
                  <CardDescription>Your account protection overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          <p className="text-sm font-medium">Failed Login Attempts</p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.securityStatus.failedAttempts ?? 0} failed attempt(s) recorded.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Security Tips
                          </p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li className="flex items-center gap-1.5">
                              <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              Use a strong, unique password
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                              Enable 2FA when available
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Common Tasks ────────────────────────────── */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Tasks</CardTitle>
                  <CardDescription>Frequently used actions and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    <QuickAction
                      icon={<FileText className="h-5 w-5" />}
                      label="FBR IRIS Export"
                      description="Generate ITR-1 XML for filing"
                      onClick={() => setView('iris-export')}
                    />
                    <QuickAction
                      icon={<ShieldCheck className="h-5 w-5" />}
                      label="Audit Log"
                      description="Track account activity"
                      onClick={() => setView('audit-log')}
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

/** Stat card with NO animation (used for text/security) */
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
    <Card className="p-4">
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

/** Stat card WITH requestAnimationFrame animated counter */
function AnimatedStatCard({
  icon,
  iconBg,
  label,
  targetValue,
  animatedValue,
  variant,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  targetValue: number
  animatedValue: number
  variant: 'number' | 'currency'
}) {
  const displayValue =
    variant === 'currency'
      ? formatCurrency(animatedValue)
      : animatedValue.toLocaleString('en-PK')

  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 truncate font-semibold tabular-nums text-foreground">
            {displayValue}
          </p>
          {/* Progress bar showing animation progress */}
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 ease-out"
              style={{
                width: `${
                  targetValue === 0
                    ? 0
                    : Math.min(100, (animatedValue / targetValue) * 100)
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

/** Square icon button for Quick Actions grid */
function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${color}`}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  )
}

/** Larger action card for the common tasks row */
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
      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
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

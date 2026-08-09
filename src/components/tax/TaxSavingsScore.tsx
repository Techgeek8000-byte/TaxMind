'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Briefcase,
  Home,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Lightbulb,
  Loader2,
  ArrowLeft,
  Zap,
  CircleDollarSign,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { formatPKR, type IncomeHead, type SavingsStrategy, type SavingsScoreResult } from '@/lib/tax-engine'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────────────

interface PresumptiveComparison {
  presumptiveTax: number
  normalTax: number
  savings: number
  recommendation: 'presumptive' | 'normal'
}

// ─── Constants ──────────────────────────────────────────────────────────

const INCOME_HEADS: { value: IncomeHead; label: string; icon: typeof Wallet }[] = [
  { value: 'salary', label: 'Salary', icon: Wallet },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'property', label: 'Property', icon: Home },
  { value: 'capital_gains', label: 'Capital Gains', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: CircleDollarSign },
]

const ENTITY_TYPES = [
  { value: 'individual_salary', label: 'Individual (Salaried)' },
  { value: 'individual_business', label: 'Individual (Business)' },
  { value: 'aop', label: 'Association of Persons (AOP)' },
  { value: 'company', label: 'Company' },
  { value: 'small_company', label: 'Small Company' },
] as const

const TAX_YEAR = '2024-2025'

// ─── Zod Schema ──────────────────────────────────────────────────────────

const savingsFormSchema = z.object({
  grossIncome: z.coerce.number({ message: 'Enter a valid number' }).positive('Income must be greater than 0'),
  incomeHead: z.enum(['salary', 'business', 'property', 'capital_gains', 'other'] as const),
  entityType: z.enum(['individual_salary', 'individual_business', 'aop', 'company', 'small_company'] as const).optional(),
})

type SavingsFormData = z.infer<typeof savingsFormSchema>

// ─── Helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score <= 30) return 'text-red-500'
  if (score <= 60) return 'text-amber-500'
  return 'text-emerald-500'
}

function scoreStroke(score: number): string {
  if (score <= 30) return 'stroke-red-500'
  if (score <= 60) return 'stroke-amber-500'
  return 'stroke-emerald-500'
}

function scoreRingBg(score: number): string {
  if (score <= 30) return 'text-red-500/10'
  if (score <= 60) return 'text-amber-500/10'
  return 'text-emerald-500/10'
}

function riskBadgeClass(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200'
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200'
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200'
  }
}

function riskIcon(risk: 'low' | 'medium' | 'high') {
  switch (risk) {
    case 'low': return ShieldCheck
    case 'medium': return ShieldAlert
    case 'high': return ShieldAlert
  }
}

// ─── Animated Counter ───────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { return }
    let startTime: number | null = null
    let raf: number
    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
        setDisplay(0)
      }
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display}</>
}

// ─── Radial Score Ring ─────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          className={scoreRingBg(score)}
          strokeWidth="12"
        />
        <motion.circle
          cx="100" cy="100" r={radius}
          fill="none"
          className={scoreStroke(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold tabular-nums ${scoreColor(score)}`}>
          <AnimatedCounter value={score} />
        </span>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">out of 100</span>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ───────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-[200px] w-[200px] rounded-full" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Separator />
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function TaxSavingsScore() {
  const setView = useAppStore((s) => s.setView)
  const [result, setResult] = useState<SavingsScoreResult | null>(null)
  const [presumptiveResult, setPresumptiveResult] = useState<PresumptiveComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [presumptiveLoading, setPresumptiveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: {
      grossIncome: undefined,
      incomeHead: 'salary',
      entityType: 'individual_salary',
    },
  })

  const incomeHead = watch('incomeHead')
  const grossIncome = watch('grossIncome')
  const isBusiness = incomeHead === 'business'

  const analyzeSavings = useCallback(async (data: SavingsFormData) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setPresumptiveResult(null)

    try {
      const res = await fetch('/api/tax/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          taxYear: TAX_YEAR,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Analysis failed')
      setResult(json.data)

      // If business income, also fetch presumptive comparison
      if (data.incomeHead === 'business' && data.grossIncome > 0) {
        setPresumptiveLoading(true)
        try {
          const pRes = await fetch('/api/tax/presumptive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ income: data.grossIncome, category: 'service_provider' }),
          })
          const pJson = await pRes.json()
          if (pJson.success) setPresumptiveResult(pJson.data)
        } catch {
          // Non-critical — don't fail the whole analysis
        } finally {
          setPresumptiveLoading(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const top3 = result?.strategies.slice(0, 3) ?? []
  const monthlyOverpay = result ? Math.round(result.totalPotentialSaving / 12) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" />
              Tax Savings Score
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Discover how much you could save with smart tax optimization strategies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Input Panel ── */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-lg">Tax Scenario</CardTitle>
              <CardDescription>Enter your income details to analyse savings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(analyzeSavings)} className="space-y-4">
                {/* Gross Income */}
                <div className="space-y-2">
                  <Label htmlFor="grossIncome">Gross Annual Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      PKR
                    </span>
                    <Input
                      id="grossIncome"
                      type="number"
                      placeholder="e.g. 5,000,000"
                      className="pl-12"
                      {...register('grossIncome')}
                    />
                  </div>
                  {errors.grossIncome && (
                    <p className="text-xs text-destructive">{errors.grossIncome.message}</p>
                  )}
                </div>

                {/* Income Head */}
                <div className="space-y-2">
                  <Label>Income Head</Label>
                  <Controller
                    name="incomeHead"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select income head" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_HEADS.map((h) => (
                            <SelectItem key={h.value} value={h.value}>
                              <span className="flex items-center gap-2">
                                <h.icon className="h-4 w-4" />
                                {h.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Entity Type */}
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Controller
                    name="entityType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENTITY_TYPES.map((e) => (
                            <SelectItem key={e.value} value={e.value}>
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Analyze Savings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ── Results Panel ── */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-start gap-3 pt-6">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-destructive">Analysis Failed</p>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {loading && !error && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <LoadingSkeleton />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* ── Score Display ── */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        <ScoreRing score={result.score} />

                        <div className="space-y-1">
                          <h2 className="text-xl font-semibold">
                            {result.score >= 61
                              ? "You're overpaying — significant savings possible!"
                              : result.score >= 31
                                ? 'Moderate savings potential found'
                                : result.totalPotentialSaving > 0
                                  ? 'Limited but real savings available'
                                  : "Your tax is well-optimized"}
                          </h2>
                          {result.totalPotentialSaving > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              You could save{' '}
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                PKR {formatPKR(result.totalPotentialSaving)}/year
                              </span>{' '}
                              (≈ PKR {formatPKR(monthlyOverpay)}/month)
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No additional optimization strategies identified for your scenario
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Current Tax</p>
                            <p className="font-semibold text-sm">PKR {formatPKR(result.currentTax)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Optimized Tax</p>
                            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                              PKR {formatPKR(result.optimizedTax)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Potential Saving</p>
                            <p className="font-semibold text-sm text-primary">
                              PKR {formatPKR(result.totalPotentialSaving)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── Tabs: Strategies / Top Actions / Presumptive ── */}
                  <Tabs defaultValue="strategies" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="strategies">All Strategies</TabsTrigger>
                      <TabsTrigger value="top-actions">Top 3 Actions</TabsTrigger>
                      {isBusiness && <TabsTrigger value="presumptive">Presumptive vs Normal</TabsTrigger>}
                    </TabsList>

                    {/* ── Strategies Breakdown ── */}
                    <TabsContent value="strategies">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            Savings Breakdown
                          </CardTitle>
                          <CardDescription>
                            {result.strategies.length} applicable strategies found for{' '}
                            {INCOME_HEADS.find((h) => h.value === incomeHead)?.label} income
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {result.strategies.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                              <p>No applicable strategies found for your income head.</p>
                            </div>
                          ) : (
                            <div className="max-h-[480px] overflow-y-auto rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow className="sticky top-0 bg-background z-10">
                                    <TableHead className="w-[40%]">Strategy</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead className="text-right">Saving (PKR)</TableHead>
                                    <TableHead>Risk</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.strategies.map((strategy, idx) => (
                                    <TableRow key={strategy.id}>
                                      <TableCell className="font-medium text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground text-xs font-mono">{idx + 1}.</span>
                                          {strategy.title}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">
                                          {strategy.section}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right font-semibold tabular-nums">
                                        PKR {formatPKR(strategy.potentialSavingPKR)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={riskBadgeClass(strategy.riskLevel)}
                                        >
                                          {strategy.riskLevel}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setView('calculator')}
                                          className="text-xs"
                                        >
                                          Apply
                                          <ChevronRight className="h-3 w-3 ml-1" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* ── Top 3 Actions ── */}
                    <TabsContent value="top-actions">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Top 3 Actions
                          </CardTitle>
                          <CardDescription>
                            Highest-impact strategies you should act on first
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {top3.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No strategies available</p>
                            </div>
                          ) : (
                            top3.map((strategy, idx) => {
                              const RiskIcon = riskIcon(strategy.riskLevel)
                              return (
                                <motion.div
                                  key={strategy.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.15 }}
                                >
                                  <Card className="border-l-4 border-l-primary">
                                    <CardContent className="pt-4 pb-4">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex-1 space-y-1.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                              {idx + 1}
                                            </span>
                                            <span className="font-semibold text-sm">{strategy.title}</span>
                                            <Badge variant="outline" className="font-mono text-xs">
                                              {strategy.section}
                                            </Badge>
                                            <Badge
                                              variant="outline"
                                              className={riskBadgeClass(strategy.riskLevel)}
                                            >
                                              <RiskIcon className="h-3 w-3 mr-1" />
                                              {strategy.riskLevel}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                                            {strategy.action}
                                          </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            PKR {formatPKR(strategy.potentialSavingPKR)}
                                          </span>
                                          <Button
                                            size="sm"
                                            onClick={() => setView('calculator')}
                                            className="text-xs"
                                          >
                                            Apply to Calculator
                                            <ArrowRight className="h-3 w-3 ml-1" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              )
                            })
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* ── Presumptive vs Normal ── */}
                    {isBusiness && (
                      <TabsContent value="presumptive">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <TrendingDown className="h-5 w-5 text-primary" />
                              Presumptive vs Normal Tax
                            </CardTitle>
                            <CardDescription>
                              Compare Final Tax Regime with normal progressive rates
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {presumptiveLoading ? (
                              <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-12 w-full" />
                              </div>
                            ) : presumptiveResult ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Presumptive Tax */}
                                  <Card className="bg-muted/50">
                                    <CardContent className="pt-4 text-center">
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        Presumptive Tax
                                      </p>
                                      <p className="text-2xl font-bold tabular-nums">
                                        PKR {formatPKR(presumptiveResult.presumptiveTax)}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {(grossIncome > 0
                                          ? (presumptiveResult.presumptiveTax / grossIncome) * 100
                                          : 0
                                        ).toFixed(1)}
                                        % effective rate
                                      </p>
                                    </CardContent>
                                  </Card>

                                  {/* Normal Tax */}
                                  <Card className="bg-muted/50">
                                    <CardContent className="pt-4 text-center">
                                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        Normal Tax
                                      </p>
                                      <p className="text-2xl font-bold tabular-nums">
                                        PKR {formatPKR(presumptiveResult.normalTax)}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {(grossIncome > 0
                                          ? (presumptiveResult.normalTax / grossIncome) * 100
                                          : 0
                                        ).toFixed(1)}
                                        % effective rate
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <Separator />

                                {/* Savings & Recommendation */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                  <div className="text-center sm:text-left">
                                    <p className="text-sm text-muted-foreground">Potential Savings</p>
                                    <p
                                      className={`text-2xl font-bold tabular-nums ${
                                        presumptiveResult.savings > 0
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-red-500'
                                      }`}
                                    >
                                      {presumptiveResult.savings > 0 ? '+' : ''}
                                      PKR {formatPKR(Math.abs(presumptiveResult.savings))}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`text-sm px-4 py-1.5 ${
                                      presumptiveResult.recommendation === 'presumptive'
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-amber-600 text-white hover:bg-amber-700'
                                    }`}
                                  >
                                    {presumptiveResult.recommendation === 'presumptive'
                                      ? '✓ Choose Presumptive'
                                      : '✓ Choose Normal'}
                                  </Badge>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                  {presumptiveResult.recommendation === 'presumptive'
                                    ? 'The Final Tax Regime offers a lower liability for your income level. Consider electing presumptive taxation (Sec 113-116B).'
                                    : 'Normal progressive rates result in a lower liability. Continue filing under the regular regime.'}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>Could not load presumptive comparison.</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                  </Tabs>
                </motion.div>
              )}

              {/* Empty state */}
              {!result && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Enter your income details on the left and click &quot;Analyze Savings&quot; to discover your tax optimization potential.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

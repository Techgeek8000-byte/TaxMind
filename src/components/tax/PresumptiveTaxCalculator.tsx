'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Scale,
  Loader2,
  CircleDollarSign,
  BarChart3,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Info,
  Calculator,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { formatPKR, type PresumptiveTaxCategory } from '@/lib/tax-engine'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────────────

interface PresumptiveResult {
  presumptiveTax: number
  normalTax: number
  savings: number
  recommendation: 'presumptive' | 'normal'
  category: string
}

// ─── Constants ──────────────────────────────────────────────────────────

const CATEGORIES: {
  value: PresumptiveTaxCategory
  label: string
  rate: number
  section: string
  description: string
}[] = [
  { value: 'retailer', label: 'Retailer', rate: 1, section: 'Sec 113', description: 'Retail shops with turnover < PKR 100M' },
  { value: 'wholesaler', label: 'Wholesaler', rate: 1.5, section: 'Sec 113', description: 'Wholesale / distribution businesses' },
  { value: 'service_provider', label: 'Service Provider', rate: 3, section: 'Sec 113', description: 'Service-based businesses (consulting, IT, etc.)' },
  { value: 'rice_mill', label: 'Rice / Maize / Cotton Mill', rate: 1.25, section: 'Sec 113', description: 'Rice, maize, or cotton milling operations' },
  { value: 'commercial_import', label: 'Commercial Imports', rate: 5.5, section: 'Sec 116B', description: 'Commercial importers of goods' },
  { value: 'distributor', label: 'Distributor', rate: 1.5, section: 'Sec 113', description: 'Distributors with turnover < PKR 100M' },
]

// ─── Zod Schema ──────────────────────────────────────────────────────────

const presumptiveFormSchema = z.object({
  income: z.coerce.number({ message: 'Enter a valid number' }).positive('Income must be greater than 0'),
  category: z.enum([
    'retailer',
    'wholesaler',
    'distributor',
    'service_provider',
    'rice_mill',
    'maize_mill',
    'cotton_mill',
    'commercial_import',
  ] as const),
  turnover: z.coerce.number().optional(),
})

type PresumptiveFormData = z.infer<typeof presumptiveFormSchema>

// ─── Animated Counter ───────────────────────────────────────────────────

function AnimatedValue({ value, prefix = '', suffix = '', className = '' }: {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}) {
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
      const progress = Math.min((timestamp - startTime) / 1200, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return (
    <span className={className}>
      {prefix}{formatPKR(display)}{suffix}
    </span>
  )
}

// ─── Horizontal Bar Comparison ──────────────────────────────────────────

function ComparisonBar({
  presumptiveTax,
  normalTax,
  income,
}: {
  presumptiveTax: number
  normalTax: number
  income: number
}) {
  const maxTax = Math.max(presumptiveTax, normalTax, 1)
  const presumptivePct = (presumptiveTax / maxTax) * 100
  const normalPct = (normalTax / maxTax) * 100
  const presumptiveRate = income > 0 ? ((presumptiveTax / income) * 100).toFixed(1) : '0'
  const normalRate = income > 0 ? ((normalTax / income) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-5">
      {/* Presumptive Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            Presumptive Tax
          </span>
          <span className="text-muted-foreground text-xs">{presumptiveRate}% effective</span>
        </div>
        <div className="relative h-8 w-full rounded-md bg-muted/50 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-md"
            initial={{ width: 0 }}
            animate={{ width: `${presumptivePct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 flex items-center px-3">
            <span className="text-xs font-semibold text-primary-foreground relative z-10">
              PKR {formatPKR(presumptiveTax)}
            </span>
          </div>
        </div>
      </div>

      {/* Normal Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-amber-500" />
            Normal Tax
          </span>
          <span className="text-muted-foreground text-xs">{normalRate}% effective</span>
        </div>
        <div className="relative h-8 w-full rounded-md bg-muted/50 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-amber-500 rounded-md"
            initial={{ width: 0 }}
            animate={{ width: `${normalPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          />
          <div className="absolute inset-0 flex items-center px-3">
            <span className="text-xs font-semibold text-white relative z-10">
              PKR {formatPKR(normalTax)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function PresumptiveTaxCalculator() {
  const setView = useAppStore((s) => s.setView)
  const [result, setResult] = useState<PresumptiveResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<PresumptiveTaxCategory>('service_provider')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PresumptiveFormData>({
    resolver: zodResolver(presumptiveFormSchema) as any,
    defaultValues: {
      income: undefined,
      category: 'service_provider',
      turnover: undefined,
    },
  })

  const incomeValue = watch('income')
  const categoryValue = watch('category')

  // Sync selected category for display
  useEffect(() => {
    if (categoryValue) setSelectedCategory(categoryValue)
  }, [categoryValue])

  const compare = useCallback(async (data: PresumptiveFormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tax/presumptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income: data.income, category: data.category }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Comparison failed')
      setResult(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  const currentCatMeta = CATEGORIES.find((c) => c.value === selectedCategory)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setView('dashboard')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Scale className="h-7 w-7 text-primary" />
              Presumptive Tax Calculator
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compare Final Tax Regime (FTR) with normal progressive rates under ITO 2001
            </p>
          </div>
        </div>

        {/* ── Input Card ── */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-primary" />
              Enter Your Details
            </CardTitle>
            <CardDescription>
              Sections 113-116B — For businesses with turnover &lt; PKR 100 million
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(compare)} className="space-y-5">
              {/* Income Input — Large & Prominent */}
              <div className="space-y-2">
                <Label htmlFor="income" className="text-base font-semibold">
                  Annual Income / Turnover
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                    PKR
                  </span>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g. 10,000,000"
                    className="h-14 pl-14 text-lg font-semibold"
                    {...register('income')}
                  />
                </div>
                {errors.income && (
                  <p className="text-xs text-destructive">{errors.income.message}</p>
                )}
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Business Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <div>
                                <span className="font-medium">{cat.label}</span>
                                <span className="text-muted-foreground text-xs ml-2">
                                  ({cat.rate}% — {cat.section})
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {currentCatMeta && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {currentCatMeta.description}
                  </p>
                )}
              </div>

              {/* Turnover (optional) */}
              <div className="space-y-2">
                <Label htmlFor="turnover" className="text-sm text-muted-foreground">
                  Annual Turnover <span className="text-muted-foreground/60">(optional, for context)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    PKR
                  </span>
                  <Input
                    id="turnover"
                    type="number"
                    placeholder="e.g. 50,000,000"
                    className="pl-12"
                    {...register('turnover')}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Comparing…
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Compare Tax Regimes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-destructive/50 bg-destructive/5 mb-6">
                <CardContent className="flex items-start gap-3 pt-6">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Comparison Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading Skeleton ── */}
        <AnimatePresence>
          {loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="mb-6">
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-48 mx-auto" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Panel ── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Recommendation Banner */}
              <Card
                className={`border-l-4 ${
                  result.recommendation === 'presumptive'
                    ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                }`}
              >
                <CardContent className="flex items-center gap-4 pt-6">
                  {result.recommendation === 'presumptive' ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Info className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">
                      {result.recommendation === 'presumptive'
                        ? 'Choose Presumptive Tax (FTR)'
                        : 'Choose Normal Tax'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {result.recommendation === 'presumptive'
                        ? `The Final Tax Regime saves you PKR ${formatPKR(result.savings)} compared to normal progressive rates. This is the better option for your income level under ${currentCatMeta?.section || 'the applicable section'}.`
                        : `Normal progressive taxation results in a lower liability of PKR ${formatPKR(Math.abs(result.savings))} less than presumptive tax. The standard regime is more favourable at this income level.`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Amount Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className={
                  result.recommendation === 'presumptive'
                    ? 'ring-2 ring-emerald-500/50'
                    : ''
                }>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Presumptive Tax
                    </p>
                    <p className="text-3xl font-bold tabular-nums">
                      <AnimatedValue value={result.presumptiveTax} prefix="PKR " />
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        {currentCatMeta?.section || 'Sec 113'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {currentCatMeta?.rate || 0}% of turnover
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={
                  result.recommendation === 'normal'
                    ? 'ring-2 ring-amber-500/50'
                    : ''
                }>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Normal Tax
                    </p>
                    <p className="text-3xl font-bold tabular-nums">
                      <AnimatedValue value={result.normalTax} prefix="PKR " />
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        Sec 4
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Progressive slab rates
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Savings Highlight */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-sm text-muted-foreground">
                        {result.savings > 0 ? 'You save with presumptive tax' : 'You save with normal tax'}
                      </p>
                      <p
                        className={`text-3xl font-bold tabular-nums ${
                          result.savings > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500'
                        }`}
                      >
                        <AnimatedValue
                          value={Math.abs(result.savings)}
                          prefix="PKR "
                          className={result.savings > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500'
                          }
                        />
                      </p>
                    </div>
                    <Badge
                      className={`text-sm px-4 py-1.5 ${
                        result.recommendation === 'presumptive'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                    >
                      {result.recommendation === 'presumptive'
                        ? '✓ Presumptive Recommended'
                        : '✓ Normal Recommended'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Bar Chart Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Visual Comparison
                  </CardTitle>
                  <CardDescription>Side-by-side tax liability comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComparisonBar
                    presumptiveTax={result.presumptiveTax}
                    normalTax={result.normalTax}
                    income={incomeValue || 0}
                  />
                </CardContent>
              </Card>

              {/* Effective Rate Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Effective Rate Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Presumptive Rate</p>
                      <p className="text-4xl font-bold text-primary tabular-nums">
                        {incomeValue > 0
                          ? ((result.presumptiveTax / incomeValue) * 100).toFixed(1)
                          : '0.0'
                        }
                        <span className="text-lg">%</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Flat rate on turnover
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Normal Rate</p>
                      <p className="text-4xl font-bold text-amber-500 tabular-nums">
                        {incomeValue > 0
                          ? ((result.normalTax / incomeValue) * 100).toFixed(1)
                          : '0.0'
                        }
                        <span className="text-lg">%</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Progressive slab rates
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Rate difference:{' '}
                      <span className="font-semibold">
                        {incomeValue > 0
                          ? Math.abs(
                              (result.presumptiveTax / incomeValue) * 100 -
                              (result.normalTax / incomeValue) * 100
                            ).toFixed(1)
                          : '0.0'
                        } percentage points
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Apply to Calculator */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => setView('calculator')}
                >
                  <Calculator className="h-5 w-5" />
                  Apply to Calculator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ── */}
        {!result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Scale className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Compare Tax Regimes</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter your income and business category above to see whether the Final Tax Regime (Sec 113-116B) or normal progressive rates save you more.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

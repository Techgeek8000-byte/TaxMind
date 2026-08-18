'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore, type AppView } from '@/store/app'
import LandingPage from '@/components/landing/LandingPage'
import AppNavbar from '@/components/layout/AppNavbar'
import AuthForms from '@/components/auth/AuthForms'
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'
import TaxCalculator from '@/components/tax/TaxCalculator'
import TaxSavingsScore from '@/components/tax/TaxSavingsScore'
import PresumptiveTaxCalculator from '@/components/tax/PresumptiveTaxCalculator'
import DocumentScanner from '@/components/scanner/DocumentScanner'
import TaxReports from '@/components/reports/TaxReports'
import TaxGuides from '@/components/guides/TaxGuides'
import AuditLog from '@/components/dashboard/AuditLog'
import TaxChat from '@/components/ai/TaxChat'
import TaxInsights from '@/components/ai/TaxInsights'
import TaxYearCompare from '@/components/ai/TaxYearCompare'
import FilingAssistant from '@/components/ai/FilingAssistant'
import FloatingAIAssistant from '@/components/ai/FloatingAIAssistant'
import IrisExport from '@/components/tax/IrisExport'
import WealthStatement from '@/components/tax/WealthStatement'
import TaxCalendar from '@/components/dashboard/TaxCalendar'
import {
  calculateWithholdingTax,
  calculateCapitalGainsTax,
  WHT_TYPES,
  formatPKR,
} from '@/lib/tax-engine'
import {
  Percent,
  TrendingUp,
  Calculator,
  ArrowRight,
  AlertCircle,
  Info,
  Users,
  UserX,
} from 'lucide-react'
import type { WithholdingTaxResult, CapitalGainsResult } from '@/lib/tax-engine'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'

function AuthenticatedApp() {
  const { view } = useAppStore()
  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />
      <main className="flex-1">
        <ViewRouter view={view} />
      </main>
      <FloatingAIAssistant />
    </div>
  )
}

function ViewRouter({ view }: { view: AppView }) {
  switch (view) {
    case 'dashboard':
      return <EnhancedDashboard />
    case 'calculator':
      return <TaxCalculator />
    case 'savings-score':
      return <TaxSavingsScore />
    case 'presumptive-tax':
      return <PresumptiveTaxCalculator />
    case 'scanner':
      return <DocumentScanner />
    case 'reports':
      return <TaxReports />
    case 'guides':
    case 'guide-detail':
      return <TaxGuides />
    case 'audit-log':
      return <AuditLog />
    case 'ai-chat':
      return <TaxChat />
    case 'ai-insights':
      return <TaxInsights />
    case 'ai-compare':
      return <TaxYearCompare />
    case 'ai-filing':
      return <FilingAssistant />
    case 'iris-export':
      return <IrisExport />
    case 'wealth-statement':
      return <WealthStatement />
    case 'tax-calendar':
      return <TaxCalendar />
    case 'wht-calculator':
      return <WHTCalculatorView />
    case 'capital-gains':
      return <CapitalGainsView />
    default:
      return <EnhancedDashboard />
  }
}

// ─── WHT Calculator View ─────────────────────────────────────

function WHTCalculatorView() {
  const [amount, setAmount] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>(WHT_TYPES[0].type)
  const [result, setResult] = useState<WithholdingTaxResult | null>(null)
  const [error, setError] = useState('')

  function handleCalculate() {
    const numAmount = parseFloat(amount.replace(/,/g, ''))
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.')
      setResult(null)
      return
    }
    setError('')
    try {
      const whtResult = calculateWithholdingTax(selectedType, numAmount)
      setResult(whtResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setResult(null)
    }
  }

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0
  const nonFilerTax = result ? Math.round(result.tax * 2) : 0
  const selectedLabel = WHT_TYPES.find((w) => w.type === selectedType)?.label ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Withholding Tax Calculator
              </h1>
              <p className="mt-1 text-muted-foreground">
                Calculate WHT for any of {WHT_TYPES.length} transaction types under ITO 2001
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
              <CardDescription>
                Select a WHT type and enter the transaction amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="wht-type">WHT Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger id="wht-type">
                      <SelectValue placeholder="Select WHT type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 overflow-y-auto">
                      {WHT_TYPES.map((whtType) => (
                        <SelectItem key={whtType.type} value={whtType.type}>
                          {whtType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wht-amount">Amount (PKR)</Label>
                  <Input
                    id="wht-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1,000,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="font-mono text-lg"
                  />
                </div>
              </div>
              {error && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <div className="mt-4">
                <Button onClick={handleCalculate} disabled={!amount || !selectedType}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate WHT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Result */}
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">WHT Calculation Result</CardTitle>
                  <CardDescription>
                    {selectedLabel} · PKR {formatPKR(numAmount)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Section</p>
                      <p className="mt-1 font-semibold">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {result.section}
                        </Badge>
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Applicable Rate</p>
                      <p className="mt-1 text-lg font-semibold font-mono text-primary">
                        {(result.rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">WHT Amount</p>
                      <p className="mt-1 text-lg font-bold font-mono text-primary">
                        PKR {formatPKR(result.tax)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filer vs Non-Filer Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-4 w-4 text-primary" />
                    Filer vs Non-Filer Comparison
                  </CardTitle>
                  <CardDescription>
                    Non-filers pay double the withholding tax rate on most transaction types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Filer */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Active Filer</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-mono font-medium">{(result.rate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Amount</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            PKR {formatPKR(result.tax)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Non-Filer */}
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800 dark:bg-red-950/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          <UserX className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-red-800 dark:text-red-200">Non-Filer</span>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          2× rate
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-mono font-medium">{(result.rate * 2 * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Amount</span>
                          <span className="font-mono font-bold text-red-700 dark:text-red-300">
                            PKR {formatPKR(nonFilerTax)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Filing Benefit</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-mono font-medium">
                        You save PKR {formatPKR(nonFilerTax - result.tax)} by being an active filer
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Capital Gains View ───────────────────────────────────────

const ASSET_TYPES = [
  { value: 'securities', label: 'Securities (Stocks, Bonds, Mutual Funds)' },
  { value: 'immovable_property', label: 'Immovable Property (Land, Building, Plot)' },
  { value: 'other', label: 'Other Assets (Jewellery, Art, Collectibles)' },
] as const

function CapitalGainsView() {
  const [assetType, setAssetType] = useState<string>('securities')
  const [gain, setGain] = useState<string>('')
  const [holdingMonths, setHoldingMonths] = useState<string>('12')
  const [result, setResult] = useState<CapitalGainsResult | null>(null)
  const [error, setError] = useState('')

  function handleCalculate() {
    const numGain = parseFloat(gain.replace(/,/g, ''))
    const months = parseInt(holdingMonths, 10)

    if (isNaN(numGain) || numGain <= 0) {
      setError('Please enter a valid gain amount.')
      setResult(null)
      return
    }
    if (isNaN(months) || months < 0) {
      setError('Please enter valid holding months.')
      setResult(null)
      return
    }

    setError('')
    try {
      const cgResult = calculateCapitalGainsTax(
        numGain,
        months,
        assetType as 'securities' | 'immovable_property' | 'other',
      )
      setResult(cgResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setResult(null)
    }
  }

  const numGain = parseFloat(gain.replace(/,/g, '')) || 0
  const numMonths = parseInt(holdingMonths, 10) || 0

  const holdingInfo = useMemo(() => {
    if (assetType === 'securities') {
      return numMonths > 12
        ? { status: 'Long-term', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }
        : { status: 'Short-term', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
    }
    if (assetType === 'immovable_property') {
      if (numMonths > 72) return { status: 'Exempt (>6 years)', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }
      if (numMonths > 12) return { status: 'Long-term', color: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' }
      return { status: 'Short-term', color: 'text-amber-600', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' }
    }
    return { status: 'Standard', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300' }
  }, [assetType, numMonths])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Capital Gains Tax Calculator
              </h1>
              <p className="mt-1 text-muted-foreground">
                Calculate CGT based on asset type and holding period
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Capital Gains Details</CardTitle>
              <CardDescription>Enter your disposal details to compute CGT liability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger id="asset-type">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          {a.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="holding-months">Holding Period (months)</Label>
                  <Input
                    id="holding-months"
                    type="number"
                    min="0"
                    max="600"
                    value={holdingMonths}
                    onChange={(e) => setHoldingMonths(e.target.value)}
                    placeholder="e.g. 12"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="cg-gain">Capital Gain Amount (PKR)</Label>
                  <Input
                    id="cg-gain"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5,000,000"
                    value={gain}
                    onChange={(e) => setGain(e.target.value.replace(/[^0-9,]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    className="font-mono text-lg"
                  />
                </div>
              </div>
              {error && (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <div className="mt-4">
                <Button onClick={handleCalculate} disabled={!gain || !assetType}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Capital Gains Tax
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-4 w-4 text-primary" />
                CGT Rate Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Type</TableHead>
                      <TableHead>{'Short-term (≤12m)'}</TableHead>
                      <TableHead>{'Long-term (>12m)'}</TableHead>
                      <TableHead>Exempt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Securities</TableCell>
                      <TableCell className="text-center font-mono">15%</TableCell>
                      <TableCell className="text-center font-mono">12.5%</TableCell>
                      <TableCell className="text-center">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Immovable Property</TableCell>
                      <TableCell className="text-center font-mono">15%</TableCell>
                      <TableCell className="text-center font-mono">12.5%</TableCell>
                      <TableCell className="text-center text-emerald-600">{'>6 years (Sec 37)'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Other Assets</TableCell>
                      <TableCell className="text-center font-mono">15%</TableCell>
                      <TableCell className="text-center font-mono">15%</TableCell>
                      <TableCell className="text-center">—</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Capital Gains Tax Result</CardTitle>
                  <CardDescription>
                    {ASSET_TYPES.find((a) => a.value === assetType)?.label} · Held for {numMonths} month{numMonths !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Capital Gain</p>
                      <p className="mt-1 text-lg font-semibold font-mono">
                        PKR {formatPKR(numGain)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Holding Period</p>
                      <p className="mt-1 text-lg font-semibold">
                        {numMonths} month{numMonths !== 1 ? 's' : ''}
                      </p>
                      <Badge variant="secondary" className={`mt-1 ${holdingInfo.badge}`}>
                        {holdingInfo.status}
                      </Badge>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-xs text-muted-foreground">Applicable Rate</p>
                      <p className={`mt-1 text-lg font-semibold font-mono ${holdingInfo.color}`}>
                        {(result.rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs text-muted-foreground">Capital Gains Tax</p>
                      <p className="mt-1 text-lg font-bold font-mono text-primary">
                        PKR {formatPKR(result.tax)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Holding Period Discount</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {result.holdingPeriodDiscount}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-mono font-medium">
                        Net after tax: PKR {formatPKR(numGain - result.tax)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────

export default function Home() {
  const { user, setUser, loading, view } = useAppStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const userData = await res.json()
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
          })
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    checkAuth()
  }, [setUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading TaxMind...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (view === 'register') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <AuthForms mode="register" onSwitch={() => useAppStore.getState().setView('login')} />
        </div>
      )
    }
    if (view === 'login') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <AuthForms mode="login" onSwitch={() => useAppStore.getState().setView('register')} />
        </div>
      )
    }
    return <LandingPage />
  }

  return <AuthenticatedApp />
}

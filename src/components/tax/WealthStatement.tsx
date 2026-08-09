'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Printer,
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Building2,
  Landmark,
  Car,
  Briefcase,
  Gift,
  Plane,
  Heart,
  Receipt,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ─────────────────────────────────────────────────────
interface OpeningAssets {
  property: number
  bankBalance: number
  investments: number
  vehicles: number
  businessCapital: number
  otherAssets: number
  totalLiabilities: number
}

interface Declarations {
  income: number
  gifts: number
  loansReceived: number
  remittances: number
  otherDeclarations: number
}

interface Expenditures {
  livingExpenses: number
  assetsPurchased: number
  loansRepaid: number
  taxesPaid: number
  otherExpenditures: number
}

interface WealthResult {
  openingWealth: number
  closingWealth: number
  difference: number
  isBalanced: boolean
  items: {
    category: string
    amount: number
    type: 'opening' | 'addition' | 'subtraction' | 'closing'
  }[]
}

// ─── Helpers ───────────────────────────────────────────────────
function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function parseNum(val: string): number {
  const cleaned = val.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function toInputStr(val: number): string {
  if (val === 0) return ''
  return String(val)
}

const OPENING_FIELDS: { key: keyof OpeningAssets; label: string; icon: React.ReactNode }[] = [
  { key: 'property', label: 'Property Value', icon: <Landmark className="h-4 w-4" /> },
  { key: 'bankBalance', label: 'Bank Balance', icon: <Wallet className="h-4 w-4" /> },
  { key: 'investments', label: 'Investments', icon: <Building2 className="h-4 w-4" /> },
  { key: 'vehicles', label: 'Vehicles', icon: <Car className="h-4 w-4" /> },
  { key: 'businessCapital', label: 'Business Capital', icon: <Briefcase className="h-4 w-4" /> },
  { key: 'otherAssets', label: 'Other Assets', icon: <FileText className="h-4 w-4" /> },
]

const DECLARATION_FIELDS: { key: keyof Declarations; label: string; icon: React.ReactNode }[] = [
  { key: 'income', label: 'Declared Income', icon: <Receipt className="h-4 w-4" /> },
  { key: 'gifts', label: 'Gifts Received', icon: <Gift className="h-4 w-4" /> },
  { key: 'loansReceived', label: 'Loans Received', icon: <Landmark className="h-4 w-4" /> },
  { key: 'remittances', label: 'Foreign Remittances', icon: <Plane className="h-4 w-4" /> },
  { key: 'otherDeclarations', label: 'Other Declarations', icon: <FileText className="h-4 w-4" /> },
]

const EXPENDITURE_FIELDS: { key: keyof Expenditures; label: string; icon: React.ReactNode }[] = [
  { key: 'livingExpenses', label: 'Living Expenses', icon: <Heart className="h-4 w-4" /> },
  { key: 'assetsPurchased', label: 'Assets Purchased', icon: <Building2 className="h-4 w-4" /> },
  { key: 'loansRepaid', label: 'Loans Repaid', icon: <Landmark className="h-4 w-4" /> },
  { key: 'taxesPaid', label: 'Taxes Paid', icon: <Receipt className="h-4 w-4" /> },
  { key: 'otherExpenditures', label: 'Other Expenditures', icon: <FileText className="h-4 w-4" /> },
]

// ─── AI Suggested Explanations for wealth difference ───────────
function getAISuggestions(difference: number, openingWealth: number): string[] {
  const suggestions: string[] = []
  const absDiff = Math.abs(difference)
  const pct = openingWealth > 0 ? (absDiff / openingWealth) * 100 : 0

  if (difference < 0) {
    suggestions.push(`Unexplained outflow of ${formatPKR(absDiff)} (${pct.toFixed(1)}% of opening wealth). FBR may classify this as undeclared income.`)
    suggestions.push('Consider reviewing: undocumented living expenses, cash withdrawals, or loans/gifts given that were not declared.')
    if (pct > 10) {
      suggestions.push('Significant discrepancy detected (>10%). Ensure all expenditure categories are fully accounted for.')
    }
    suggestions.push('Common audit triggers: unexplained wealth decrease may lead to FBR inquiry under Sec 116.')
  } else if (difference > 0) {
    suggestions.push(`Wealth increase of ${formatPKR(difference)} beyond declared additions. This may indicate unreported income.`)
    suggestions.push('Verify: capital appreciation on assets, inheritances received, or income sources not yet declared.')
    if (pct > 10) {
      suggestions.push('Material variance detected. Ensure all income heads (salary, business, property, capital gains) are included.')
    }
  }
  return suggestions
}

// ─── Component ─────────────────────────────────────────────────
export default function WealthStatement() {
  // Opening assets
  const [openingAssets, setOpeningAssets] = useState<OpeningAssets>({
    property: 0,
    bankBalance: 0,
    investments: 0,
    vehicles: 0,
    businessCapital: 0,
    otherAssets: 0,
    totalLiabilities: 0,
  })

  // Declarations
  const [declarations, setDeclarations] = useState<Declarations>({
    income: 0,
    gifts: 0,
    loansReceived: 0,
    remittances: 0,
    otherDeclarations: 0,
  })

  // Expenditures
  const [expenditures, setExpenditures] = useState<Expenditures>({
    livingExpenses: 0,
    assetsPurchased: 0,
    loansRepaid: 0,
    taxesPaid: 0,
    otherExpenditures: 0,
  })

  // UI state
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<WealthResult | null>(null)
  const [error, setError] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('opening')

  // ─── Auto-calculations ──────────────────────────────────────
  const netOpeningWealth = useMemo(() => {
    return (
      openingAssets.property +
      openingAssets.bankBalance +
      openingAssets.investments +
      openingAssets.vehicles +
      openingAssets.businessCapital +
      openingAssets.otherAssets -
      openingAssets.totalLiabilities
    )
  }, [openingAssets])

  const totalDeclarations = useMemo(() => {
    return (
      declarations.income +
      declarations.gifts +
      declarations.loansReceived +
      declarations.remittances +
      declarations.otherDeclarations
    )
  }, [declarations])

  const totalExpenditures = useMemo(() => {
    return (
      expenditures.livingExpenses +
      expenditures.assetsPurchased +
      expenditures.loansRepaid +
      expenditures.taxesPaid +
      expenditures.otherExpenditures
    )
  }, [expenditures])

  // ─── Input handlers ─────────────────────────────────────────
  const updateOpening = useCallback((key: keyof OpeningAssets, value: string) => {
    setOpeningAssets((prev) => ({ ...prev, [key]: parseNum(value) }))
  }, [])

  const updateDeclaration = useCallback((key: keyof Declarations, value: string) => {
    setDeclarations((prev) => ({ ...prev, [key]: parseNum(value) }))
  }, [])

  const updateExpenditure = useCallback((key: keyof Expenditures, value: string) => {
    setExpenditures((prev) => ({ ...prev, [key]: parseNum(value) }))
  }, [])

  // ─── Generate Statement ────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/tax/wealth-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingAssets,
          declarations,
          expenditures,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to generate wealth statement')
        return
      }

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }, [openingAssets, declarations, expenditures])

  // ─── Print / Download ──────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (!result) return

    const suggestions = result.difference !== 0
      ? getAISuggestions(result.difference, result.openingWealth)
      : []

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>FBR Wealth Statement – Section 116</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 4px; color: #065f46; }
  .subtitle { font-size: 13px; color: #666; margin-bottom: 24px; }
  .section-title { font-size: 14px; font-weight: 700; color: #065f46; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #d1fae5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; background: #f0fdf4; color: #065f46; font-weight: 600; border-bottom: 1px solid #d1d5db; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  .amount { text-align: right; font-family: 'Courier New', monospace; }
  .total-row { font-weight: 700; background: #f0fdf4; }
  .negative { color: #dc2626; }
  .positive { color: #059669; }
  .summary-box { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; }
  .summary-item { background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 8px; padding: 12px; text-align: center; }
  .summary-item .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-item .value { font-size: 18px; font-weight: 700; color: #065f46; margin-top: 4px; }
  .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin: 16px 0; }
  .warning h3 { font-size: 13px; color: #92400e; margin-bottom: 6px; }
  .warning ul { padding-left: 20px; font-size: 12px; color: #78350f; }
  .warning li { margin-bottom: 4px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>FBR Wealth Statement</h1>
  <p class="subtitle">Section 116 — Income Tax Ordinance 2001 | Tax Year 2024-2025</p>

  <div class="summary-box">
    <div class="summary-item">
      <div class="label">Opening Wealth</div>
      <div class="value">PKR ${result.openingWealth.toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="label">Closing Wealth</div>
      <div class="value">PKR ${result.closingWealth.toLocaleString()}</div>
    </div>
    <div class="summary-item">
      <div class="label">Difference</div>
      <div class="value ${result.difference < 0 ? 'negative' : result.difference > 0 ? 'positive' : ''}">PKR ${result.difference.toLocaleString()}</div>
    </div>
  </div>

  ${result.items
    .map((item) => {
      if (item.type === 'opening') return null
      if (item.category.includes('Total')) return null
      return `
      <tr>
        <td>${item.category}</td>
        <td class="amount ${item.amount < 0 ? 'negative' : 'positive'}">${item.amount < 0 ? '(' : ''}PKR ${Math.abs(item.amount).toLocaleString()}${item.amount < 0 ? ')' : ''}</td>
      </tr>`
    })
    .filter(Boolean)
    .join('')}

  ${suggestions.length > 0 ? `
  <div class="warning">
    <h3>⚠ AI-Generated Observations</h3>
    <ul>${suggestions.map((s) => `<li>${s}</li>`).join('')}</ul>
  </div>` : ''}

  <div class="footer">
    Generated by TaxMind Pakistan • ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
    This is an auto-generated statement for reference only. Verify with FBR IRIS before filing.
  </div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.print()
    }
  }, [result])

  // ─── Reset ─────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setOpeningAssets({
      property: 0,
      bankBalance: 0,
      investments: 0,
      vehicles: 0,
      businessCapital: 0,
      otherAssets: 0,
      totalLiabilities: 0,
    })
    setDeclarations({
      income: 0,
      gifts: 0,
      loansReceived: 0,
      remittances: 0,
      otherDeclarations: 0,
    })
    setExpenditures({
      livingExpenses: 0,
      assetsPurchased: 0,
      loansRepaid: 0,
      taxesPaid: 0,
      otherExpenditures: 0,
    })
    setResult(null)
    setError('')
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  const suggestions = useMemo(() => {
    if (!result || result.difference === 0) return []
    return getAISuggestions(result.difference, result.openingWealth)
  }, [result])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Wealth Statement</h1>
              <p className="text-sm text-muted-foreground">FBR Section 116 — Tax Year 2024-2025</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Opening Wealth ──────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="mb-4">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('opening')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Opening Wealth (Assets)</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    Net: {formatPKR(netOpeningWealth)}
                  </Badge>
                </div>
                {expandedSection === 'opening' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardDescription>Enter your wealth as of July 1, 2024</CardDescription>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'opening' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="space-y-3 pb-6">
                    {OPENING_FIELDS.map((field) => (
                      <div key={field.key} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-1">
                          <Label htmlFor={`opening-${field.key}`} className="flex items-center gap-2 text-sm">
                            {field.icon}
                            {field.label}
                          </Label>
                          <Input
                            id={`opening-${field.key}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={toInputStr(openingAssets[field.key])}
                            onChange={(e) => updateOpening(field.key, e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <span className="text-sm font-mono text-muted-foreground">
                            {formatPKR(openingAssets[field.key])}
                          </span>
                        </div>
                      </div>
                    ))}

                    <Separator className="my-4" />

                    {/* Liabilities */}
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-1">
                        <Label htmlFor="opening-totalLiabilities" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <ArrowUpRight className="h-4 w-4" />
                          Total Liabilities
                        </Label>
                        <Input
                          id="opening-totalLiabilities"
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={toInputStr(openingAssets.totalLiabilities)}
                          onChange={(e) => updateOpening('totalLiabilities', e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <span className="text-sm font-mono text-red-600 dark:text-red-400">
                          -{formatPKR(openingAssets.totalLiabilities)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        Net Opening Wealth: {formatPKR(netOpeningWealth)}
                      </p>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ─── Declarations ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-4">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('declarations')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Declarations (Additions)</CardTitle>
                  <Badge variant="outline" className="border-emerald-300 font-mono text-xs text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                    Total: {formatPKR(totalDeclarations)}
                  </Badge>
                </div>
                {expandedSection === 'declarations' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardDescription>Income and inflows during the tax year</CardDescription>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'declarations' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="space-y-3 pb-6">
                    {DECLARATION_FIELDS.map((field) => (
                      <div key={field.key} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-1">
                          <Label htmlFor={`decl-${field.key}`} className="flex items-center gap-2 text-sm">
                            {field.icon}
                            {field.label}
                          </Label>
                          <Input
                            id={`decl-${field.key}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={toInputStr(declarations[field.key])}
                            onChange={(e) => updateDeclaration(field.key, e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                            +{formatPKR(declarations[field.key])}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                        Total Additions: {formatPKR(totalDeclarations)}
                      </p>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ─── Expenditures ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="mb-4">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => toggleSection('expenditures')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Expenditures (Subtractions)</CardTitle>
                  <Badge variant="outline" className="border-amber-300 font-mono text-xs text-amber-700 dark:border-amber-700 dark:text-amber-300">
                    Total: {formatPKR(totalExpenditures)}
                  </Badge>
                </div>
                {expandedSection === 'expenditures' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardDescription>Expenses and outflows during the tax year</CardDescription>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'expenditures' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <CardContent className="space-y-3 pb-6">
                    {EXPENDITURE_FIELDS.map((field) => (
                      <div key={field.key} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-1">
                          <Label htmlFor={`exp-${field.key}`} className="flex items-center gap-2 text-sm">
                            {field.icon}
                            {field.label}
                          </Label>
                          <Input
                            id={`exp-${field.key}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={toInputStr(expenditures[field.key])}
                            onChange={(e) => updateExpenditure(field.key, e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
                            -{formatPKR(expenditures[field.key])}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Total Expenditures: {formatPKR(totalExpenditures)}
                      </p>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ─── Action Buttons ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} disabled={generating} className="min-w-[160px]">
              {generating ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Statement
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!result}>
              <Printer className="mr-2 h-4 w-4" />
              Print / Download
            </Button>
            <Button variant="outline" disabled>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </motion.div>

        {/* ─── Error ──────────────────────────────────────── */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="flex items-center gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Loading State ─────────────────────────────── */}
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Results ───────────────────────────────────── */}
        <AnimatePresence>
          {result && !generating && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-6 space-y-4"
            >
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opening Wealth</p>
                  <p className="mt-1 text-lg font-bold font-mono">{formatPKR(result.openingWealth)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Closing Wealth</p>
                  <p className="mt-1 text-lg font-bold font-mono">{formatPKR(result.closingWealth)}</p>
                </Card>
                <Card className={`p-4 ${result.difference !== 0 ? 'border-amber-300 dark:border-amber-700' : 'border-emerald-300 dark:border-emerald-700'}`}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difference</p>
                  <p className={`mt-1 text-lg font-bold font-mono ${result.difference < 0 ? 'text-red-600 dark:text-red-400' : result.difference > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatPKR(result.difference)}
                  </p>
                </Card>
              </div>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Statement Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Opening Section */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Opening Assets</p>
                      <div className="space-y-1">
                        {result.items
                          .filter((i) => i.type === 'opening')
                          .map((item, idx) => (
                            <div key={idx} className={`flex justify-between rounded px-3 py-1.5 text-sm ${item.category.includes('Net') ? 'bg-emerald-50 font-semibold dark:bg-emerald-900/20' : ''}`}>
                              <span className={item.amount < 0 ? 'text-red-600 dark:text-red-400' : ''}>{item.category}</span>
                              <span className={`font-mono ${item.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                {item.amount < 0 ? `(${formatPKR(Math.abs(item.amount))})` : formatPKR(item.amount)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Additions */}
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        <ArrowDownRight className="h-3 w-3" /> Additions
                      </p>
                      <div className="space-y-1">
                        {result.items
                          .filter((i) => i.type === 'addition')
                          .map((item, idx) => (
                            <div key={idx} className={`flex justify-between rounded px-3 py-1.5 text-sm ${item.category.includes('Total') ? 'bg-teal-50 font-semibold dark:bg-teal-900/20' : ''}`}>
                              <span>{item.category}</span>
                              <span className="font-mono text-teal-600 dark:text-teal-400">+{formatPKR(item.amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Subtractions */}
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        <ArrowUpRight className="h-3 w-3" /> Subtractions
                      </p>
                      <div className="space-y-1">
                        {result.items
                          .filter((i) => i.type === 'subtraction')
                          .map((item, idx) => (
                            <div key={idx} className={`flex justify-between rounded px-3 py-1.5 text-sm ${item.category.includes('Total') ? 'bg-amber-50 font-semibold dark:bg-amber-900/20' : ''}`}>
                              <span>{item.category}</span>
                              <span className="font-mono text-amber-600 dark:text-amber-400">{formatPKR(item.amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Closing */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Closing</p>
                      <div className="space-y-1">
                        {result.items
                          .filter((i) => i.type === 'closing')
                          .map((item, idx) => (
                            <div key={idx} className="flex justify-between rounded bg-emerald-50 px-3 py-2 text-sm font-semibold dark:bg-emerald-900/20">
                              <span>{item.category}</span>
                              <span className="font-mono">{formatPKR(item.amount)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Warning if difference != 0 */}
              {suggestions.length > 0 && (
                <Card className="border-amber-300 dark:border-amber-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      Wealth Reconciliation Alert
                    </CardTitle>
                    <CardDescription>AI-suggested explanations for the discrepancy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          <span className="text-amber-800 dark:text-amber-200">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Balanced confirmation */}
              {result.isBalanced && result.difference === 0 && (
                <Card className="border-emerald-300 dark:border-emerald-700">
                  <CardContent className="flex items-center gap-3 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">Wealth Statement Balanced</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">Your wealth reconciliation is complete and balanced.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}



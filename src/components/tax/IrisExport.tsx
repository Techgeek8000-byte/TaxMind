'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  FileCode2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  User,
  FileText,
  ChevronDown,
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

import { formatPKR, type TaxResult } from '@/lib/tax-engine'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────────────

interface TaxpayerInfo {
  ntn: string
  name: string
  cnic: string
  address: string
  phone: string
}

interface SavedCalculation {
  id: string
  taxYear: string
  incomeHead: string
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  taxComputed: number
  superTax: number
  minimumTax: number
  totalTax: number
  effectiveRate: number
  inputJson: unknown
  createdAt: string
}

// ─── Constants ──────────────────────────────────────────────────────────

const INCOME_HEAD_LABELS: Record<string, string> = {
  salary: 'Salary',
  business: 'Business',
  property: 'Property',
  capital_gains: 'Capital Gains',
  other: 'Other Sources',
}

// ─── Animation ──────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// ─── Helper: Build TaxResult from a saved calculation ───────────────────

function toTaxResult(calc: SavedCalculation): TaxResult {
  return {
    grossIncome: calc.grossIncome,
    totalDeductions: calc.totalDeductions,
    taxableIncome: calc.taxableIncome,
    taxComputed: calc.taxComputed,
    superTax: calc.superTax,
    minimumTax: calc.minimumTax,
    totalTax: calc.totalTax,
    effectiveRate: calc.effectiveRate,
    breakdown: {
      incomeHead: calc.incomeHead,
      slabs: [],
      deductions: [],
    },
  }
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function IrisExport() {
  const { setView } = useAppStore()

  // ── State ──
  const [taxpayerInfo, setTaxpayerInfo] = useState<TaxpayerInfo>({
    ntn: '',
    name: '',
    cnic: '',
    address: '',
    phone: '',
  })
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [selectedCalcId, setSelectedCalcId] = useState<string>('')
  const [xmlOutput, setXmlOutput] = useState<string>('')
  const [xmlFilename, setXmlFilename] = useState<string>('')
  const [isLoadingCalcs, setIsLoadingCalcs] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch saved calculations ──
  useEffect(() => {
    let cancelled = false

    async function fetchCalculations() {
      try {
        const res = await fetch('/api/tax/calculations')
        if (!res.ok) throw new Error('Failed to load calculations')
        const data = await res.json()
        if (!cancelled) {
          setCalculations(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) setError('Could not load your saved calculations. Please try again later.')
      } finally {
        if (!cancelled) setIsLoadingCalcs(false)
      }
    }

    fetchCalculations()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedCalc = calculations.find((c) => c.id === selectedCalcId)

  // ── Field updater ──
  const updateField = useCallback((field: keyof TaxpayerInfo, value: string) => {
    setTaxpayerInfo((prev) => ({ ...prev, [field]: value }))
    // Clear XML when taxpayer info changes
    setXmlOutput('')
    setError(null)
  }, [])

  const handleCalcSelect = useCallback((calcId: string) => {
    setSelectedCalcId(calcId)
    setXmlOutput('')
    setError(null)
  }, [])

  // ── Validation ──
  const canGenerate =
    taxpayerInfo.ntn.trim() !== '' &&
    taxpayerInfo.name.trim() !== '' &&
    selectedCalcId !== ''

  // ── Generate XML ──
  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !selectedCalc) return

    setIsGenerating(true)
    setError(null)
    setXmlOutput('')

    try {
      const taxResult = toTaxResult(selectedCalc)

      const res = await fetch('/api/tax/iris-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxResult, taxpayerInfo }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to generate XML')
        return
      }

      setXmlOutput(data.xml)
      setXmlFilename(data.filename || `FBR_Return_NTN_${taxpayerInfo.ntn}_TY2025.xml`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [canGenerate, selectedCalc, taxpayerInfo])

  // ── Download XML ──
  const handleDownload = useCallback(() => {
    if (!xmlOutput || !xmlFilename) return

    const blob = new Blob([xmlOutput], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = xmlFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [xmlOutput, xmlFilename])

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setView('dashboard')}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">FBR IRIS XML Export</h1>
          <p className="text-sm text-muted-foreground">Generate a tax return file compatible with FBR IRIS</p>
        </div>
      </div>

      {/* ── Taxpayer Information ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-emerald-600" />
            Taxpayer Information
          </CardTitle>
          <CardDescription>Enter the taxpayer details for the XML return</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ntn">
                NTN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ntn"
                placeholder="e.g. 1234567"
                value={taxpayerInfo.ntn}
                onChange={(e) => updateField('ntn', e.target.value)}
                className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxpayer-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="taxpayer-name"
                placeholder="e.g. Muhammad Ali"
                value={taxpayerInfo.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC (optional)</Label>
              <Input
                id="cnic"
                placeholder="e.g. 35201-1234567-1"
                value={taxpayerInfo.cnic}
                onChange={(e) => updateField('cnic', e.target.value)}
                className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="e.g. 0300-1234567"
                value={taxpayerInfo.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              placeholder="e.g. House 12, Street 5, F-7/1, Islamabad"
              value={taxpayerInfo.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Calculation Selection ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-emerald-600" />
            Select Calculation
          </CardTitle>
          <CardDescription>
            Pick a saved tax calculation to include in the return
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingCalcs ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : calculations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No saved calculations found. Run a tax calculation first.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                onClick={() => setView('calculator')}
              >
                Go to Calculator
              </Button>
            </div>
          ) : (
            <>
              <Select value={selectedCalcId} onValueChange={handleCalcSelect}>
                <SelectTrigger className="border-emerald-200 focus:ring-emerald-500 dark:border-emerald-800">
                  <SelectValue placeholder="Choose a calculation..." />
                </SelectTrigger>
                <SelectContent>
                  {calculations.map((calc) => (
                    <SelectItem key={calc.id} value={calc.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {INCOME_HEAD_LABELS[calc.incomeHead] || calc.incomeHead}
                        </Badge>
                        <span>Tax Year {calc.taxYear}</span>
                        <span className="text-muted-foreground">
                          — PKR {formatPKR(calc.totalTax)} tax
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Calculation Summary */}
              <AnimatePresence>
                {selectedCalc && (
                  <motion.div
                    key={selectedCalc.id}
                    {...fadeIn}
                    transition={{ duration: 0.25 }}
                    className="rounded-lg border bg-muted/40 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                        {INCOME_HEAD_LABELS[selectedCalc.incomeHead] || selectedCalc.incomeHead}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Tax Year {selectedCalc.taxYear}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Gross Income</p>
                        <p className="font-semibold">PKR {formatPKR(selectedCalc.grossIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Taxable Income</p>
                        <p className="font-semibold">PKR {formatPKR(selectedCalc.taxableIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Tax</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">
                          PKR {formatPKR(selectedCalc.totalTax)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deductions</p>
                        <p className="font-medium">PKR {formatPKR(selectedCalc.totalDeductions)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Effective Rate</p>
                        <p className="font-medium">
                          {(selectedCalc.effectiveRate * 100).toFixed(1)}%
                        </p>
                      </div>
                      {selectedCalc.superTax > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Super Tax</p>
                          <p className="font-medium">PKR {formatPKR(selectedCalc.superTax)}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Generate Button ── */}
      <AnimatePresence>
        {canGenerate && !xmlOutput && (
          <motion.div {...fadeIn} transition={{ duration: 0.25 }}>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating XML…
                </>
              ) : (
                <>
                  <FileCode2 className="mr-2 h-4 w-4" />
                  Generate XML
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Message ── */}
      <AnimatePresence>
        {error && (
          <motion.div {...fadeIn} transition={{ duration: 0.2 }}>
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Generation Failed</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-destructive hover:bg-destructive/10"
                onClick={handleGenerate}
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── XML Preview & Download ── */}
      <AnimatePresence>
        {xmlOutput && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    XML Generated Successfully
                  </CardTitle>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download XML
                  </Button>
                </div>
                <CardDescription className="text-xs">File: {xmlFilename}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* XML Display */}
                <div className="relative">
                  <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 text-sm leading-relaxed text-emerald-400 font-mono">
                    {xmlOutput}
                  </pre>
                </div>

                <Separator />

                {/* Disclaimer */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Disclaimer:</span> This is a simplified XML
                    generated for reference purposes only. Before submitting to FBR IRIS, please
                    review the contents carefully and ensure all values match your actual records.
                    TaxMind Pakistan is not responsible for any discrepancies in the generated file.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

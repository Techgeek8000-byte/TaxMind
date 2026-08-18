'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, GitCompareArrows, Calculator, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────

interface YearData {
  year: string
  taxableIncome: number
  taxComputed: number
  effectiveRate: number
  applicableSlabs: { range: string; rate: string; tax: string }[]
  keyChanges: string
}

interface CompareData {
  year1: YearData
  year2: YearData
  comparison: {
    taxDifference: number
    rateChange: string
    savingsOrExtra: string
    explanation: string
  }
  recommendation: string
}

const INCOME_HEADS = [
  { value: 'salary', label: 'Salary Income' },
  { value: 'business', label: 'Business Income' },
  { value: 'property', label: 'Property Income' },
  { value: 'capital_gains', label: 'Capital Gains' },
  { value: 'other', label: 'Other Income' },
]

const ENTITY_TYPES = [
  { value: 'individual_salaried', label: 'Individual (Salaried)' },
  { value: 'individual_other', label: 'Individual (Other)' },
  { value: 'aop', label: 'AOP' },
  { value: 'company', label: 'Company' },
]

function formatPKR(n: number): string {
  if (n === 0) return '0'
  return Math.abs(n).toLocaleString('en-PK')
}

// ─── Main Component ─────────────────────────────────────────────

export default function TaxYearCompare() {
  const { setView } = useAppStore()
  const [income, setIncome] = useState('')
  const [year1, setYear1] = useState('2023')
  const [year2, setYear2] = useState('2024')
  const [incomeHead, setIncomeHead] = useState('salary')
  const [entityType, setEntityType] = useState('individual_salaried')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<CompareData | null>(null)
  const [error, setError] = useState('')

  async function handleCompare() {
    const numIncome = parseFloat(income.replace(/,/g, ''))
    if (isNaN(numIncome) || numIncome <= 0) {
      setError('Please enter a valid income amount.')
      return
    }

    setError('')
    setIsLoading(true)
    setData(null)

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: numIncome,
          taxYear1: year1,
          taxYear2: year2,
          incomeHead,
          entityType,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setError('Comparison failed. Please try again.')
        return
      }

      setData(json.data as CompareData)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const numIncome = parseFloat(income.replace(/,/g, '')) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setView('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <GitCompareArrows className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Tax Year Comparison</h1>
            <p className="text-sm text-muted-foreground">Compare your tax liability across different FBR tax years</p>
          </div>
        </div>

        {/* Input Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Comparison Parameters</CardTitle>
              <CardDescription>Enter your income and select the tax years to compare</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ty-income">Annual Income (PKR)</Label>
                  <Input
                    id="ty-income"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2,500,000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value.replace(/[^0-9,]/g, ''))}
                    className="font-mono text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ty1">Tax Year 1</Label>
                  <Select value={year1} onValueChange={setYear1}>
                    <SelectTrigger id="ty1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['2022', '2023', '2024', '2025'].map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ty2">Tax Year 2</Label>
                  <Select value={year2} onValueChange={setYear2}>
                    <SelectTrigger id="ty2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['2022', '2023', '2024', '2025'].map((y) => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ty-head">Income Head</Label>
                  <Select value={incomeHead} onValueChange={setIncomeHead}>
                    <SelectTrigger id="ty-head"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INCOME_HEADS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              <div className="mt-4 flex gap-2">
                <Button onClick={handleCompare} disabled={!income || isLoading || year1 === year2}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Compare Tax Years
                </Button>
                {year1 === year2 && <p className="text-xs text-muted-foreground self-center">Select different tax years</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoading && (
          <div className="space-y-4 py-8">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        )}

        {data && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Side-by-Side Comparison */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Year 1 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tax Year {data.year1.year}</CardTitle>
                  <CardDescription>{data.year1.keyChanges}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Taxable Income</p>
                      <p className="text-lg font-bold font-mono">PKR {formatPKR(data.year1.taxableIncome)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Tax Computed</p>
                      <p className="text-lg font-bold font-mono text-primary">PKR {formatPKR(data.year1.taxComputed)}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Effective Rate</p>
                    <p className="text-2xl font-bold">{data.year1.effectiveRate}%</p>
                  </div>
                  {data.year1.applicableSlabs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">Applicable Slabs:</p>
                      <div className="space-y-1">
                        {data.year1.applicableSlabs.map((s, i) => (
                          <div key={i} className="flex justify-between text-xs bg-muted/50 rounded px-2 py-1">
                            <span className="text-muted-foreground">{s.range}</span>
                            <span className="font-mono">{s.rate} → {s.tax}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Year 2 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tax Year {data.year2.year}</CardTitle>
                  <CardDescription>{data.year2.keyChanges}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Taxable Income</p>
                      <p className="text-lg font-bold font-mono">PKR {formatPKR(data.year2.taxableIncome)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Tax Computed</p>
                      <p className="text-lg font-bold font-mono text-primary">PKR {formatPKR(data.year2.taxComputed)}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Effective Rate</p>
                    <p className="text-2xl font-bold">{data.year2.effectiveRate}%</p>
                  </div>
                  {data.year2.applicableSlabs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">Applicable Slabs:</p>
                      <div className="space-y-1">
                        {data.year2.applicableSlabs.map((s, i) => (
                          <div key={i} className="flex justify-between text-xs bg-muted/50 rounded px-2 py-1">
                            <span className="text-muted-foreground">{s.range}</span>
                            <span className="font-mono">{s.rate} → {s.tax}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Summary */}
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="h-4 w-4" />
                  Comparison Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Rate Change</p>
                    <p className="text-xl font-bold font-mono mt-1">{data.comparison.rateChange}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">Tax Difference</p>
                    <p className={`text-xl font-bold font-mono mt-1 ${data.comparison.taxDifference > 0 ? 'text-red-600' : data.comparison.taxDifference < 0 ? 'text-emerald-600' : ''}`}>
                      PKR {formatPKR(Math.abs(data.comparison.taxDifference))}
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs text-muted-foreground">Impact</p>
                    <p className="text-sm font-semibold mt-1">{data.comparison.savingsOrExtra}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">AI Explanation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.comparison.explanation}</p>
                </div>

                <Separator />

                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">Recommendation</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{data.recommendation}</p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-2">
              <Button onClick={handleCompare} variant="outline" disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recompare
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

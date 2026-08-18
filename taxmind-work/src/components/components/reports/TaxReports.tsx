'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileBarChart,
  Download,
  Calculator,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Calendar,
  RotateCcw,
  Eye,
  FileJson,
  Filter,
  X,
  TableProperties,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app'
import { formatNum, generateFBRReturnData } from '@/lib/tax-engine'
import type { TaxInput, TaxResult } from '@/lib/tax-engine'

// ─── Types ─────────────────────────────────────────────────────
interface TaxCalculation {
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
  inputJson: Record<string, unknown>
  createdAt: string
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateStr: string): string {
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

// ─── Report HTML Generator ─────────────────────────────────────
function generateReportHTML(
  calc: TaxCalculation,
  user: { name?: string; email: string } | null
): string {
  const input = calc.inputJson as unknown as TaxInput
  const grossIncome = Math.round(calc.grossIncome)
  const totalDeductions = Math.round(calc.totalDeductions)
  const taxableIncome = Math.round(calc.taxableIncome)
  const taxComputed = Math.round(calc.taxComputed)
  const superTax = Math.round(calc.superTax)
  const minimumTax = Math.round(calc.minimumTax)
  const totalTax = Math.round(calc.totalTax)
  const effectiveRate = calc.effectiveRate

  // Build deduction rows
  const deductionFields: [string, string][] = [
    ['Sec 60 — Investment in Pension Fund', 'sec60InvestmentPension'],
    ['Sec 61 — Life Insurance Premium', 'sec61LifeInsurance'],
    ['Sec 62 — Zakat Deduction', 'sec62Zakat'],
    ['Sec 63 — Education Allowance', 'sec63Education'],
    ['Sec 64 — Health Insurance Premium', 'sec64HealthInsurance'],
    ['Sec 64A — Charitable Donations', 'sec64ACharity'],
    ['Sec 64B — Domestic Travel', 'sec64BDomesticTravel'],
    ['Sec 64C — Computer / IT Equipment', 'sec64CComputerIT'],
    ['Sec 64D — Employer Provident Fund', 'sec64DEmployerProvidentFund'],
    ['Sec 64E — Employee Old Age Benefits', 'sec64EEmployeeOldAge'],
  ]

  const deductionRows = deductionFields
    .filter(([, key]) => {
      const val = (input as unknown as Record<string, unknown>)[key]
      return val && Number(val) > 0
    })
    .map(
      ([label, key]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">PKR ${formatNum(Number((input as unknown as Record<string, unknown>)[key]))}</td>
      </tr>`
    )
    .join('')

  // FBR Slabs for the report
  const slabs =
    input.incomeHead === 'salary'
      ? [
          { min: 0, max: 600000, rate: 0 },
          { min: 600000, max: 1200000, rate: 5 },
          { min: 1200000, max: 2200000, rate: 15 },
          { min: 2200000, max: 3200000, rate: 25 },
          { min: 3200000, max: 4100000, rate: 30 },
          { min: 4100000, max: Infinity, rate: 35 },
        ]
      : [
          { min: 0, max: 600000, rate: 0 },
          { min: 600000, max: 1200000, rate: 15 },
          { min: 1200000, max: 1600000, rate: 20 },
          { min: 1600000, max: 3200000, rate: 30 },
          { min: 3200000, max: 5600000, rate: 40 },
          { min: 5600000, max: Infinity, rate: 45 },
        ]

  const slabRows = slabs
    .map((s) => {
      const isActive = taxableIncome > s.min
      const amount = isActive
        ? Math.min(taxableIncome, s.max === Infinity ? taxableIncome : s.max) - s.min
        : 0
      const tax = Math.round(amount * (s.rate / 100))
      return `
      <tr style="${isActive ? 'background-color:#f0fdf4;' : 'opacity:0.4;'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">PKR ${formatNum(s.min)} ${s.max === Infinity ? 'and above' : `— PKR ${formatNum(s.max)}`}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${s.rate}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">PKR ${formatNum(amount)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">PKR ${formatNum(tax)}</td>
      </tr>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Report — TaxMind Pakistan</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; background: #f8fafc; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #059669; }
    .header h1 { font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #6b7280; }
    .section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .section-title { font-size: 16px; font-weight: 600; color: #059669; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #d1d5db; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f0fdf4; color: #065f46; font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 2px solid #059669; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary-row.total { font-size: 18px; font-weight: 700; color: #059669; border-top: 2px solid #059669; padding-top: 12px; margin-top: 8px; }
    .tip-box { background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; border-radius: 0 8px 8px 0; }
    .tip-box h3 { font-size: 14px; font-weight: 600; color: #065f46; margin-bottom: 8px; }
    .tip-box ul { padding-left: 20px; }
    .tip-box li { font-size: 13px; color: #374151; margin-bottom: 4px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>TaxMind Pakistan</h1>
      <p>Income Tax Computation Report — Tax Year ${calc.taxYear}</p>
      <p>Generated on ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Taxpayer Info -->
    <div class="section">
      <div class="section-title">Taxpayer Information</div>
      <div class="info-grid">
        <div class="info-item">
          <label>Name</label>
          <span>${user?.name || 'N/A'}</span>
        </div>
        <div class="info-item">
          <label>Email</label>
          <span>${user?.email || 'N/A'}</span>
        </div>
        <div class="info-item">
          <label>Tax Year</label>
          <span>${calc.taxYear}</span>
        </div>
        <div class="info-item">
          <label>Income Head</label>
          <span>${incomeHeadLabel(calc.incomeHead)}</span>
        </div>
      </div>
    </div>

    <!-- Income Summary -->
    <div class="section">
      <div class="section-title">Income & Deduction Summary</div>
      <div class="summary-row"><span>Gross Income</span><span><strong>PKR ${formatNum(grossIncome)}</strong></span></div>
      ${totalDeductions > 0 ? `<div class="summary-row" style="color:#6b7280;"><span>Less: Total Deductions</span><span style="color:#dc2626;">(PKR ${formatNum(totalDeductions)})</span></div>` : ''}
      <div class="summary-row" style="background:#f0fdf4;padding:8px 12px;border-radius:6px;"><span><strong>Taxable Income</strong></span><span><strong>PKR ${formatNum(taxableIncome)}</strong></span></div>
    </div>

    ${totalDeductions > 0 ? `
    <!-- Deductions Breakdown -->
    <div class="section">
      <div class="section-title">Deductions Breakdown</div>
      <table>
        <thead><tr><th>Section</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>
          ${deductionRows}
          <tr style="font-weight:700;background:#f0fdf4;"><td style="padding:10px 12px;">Total Deductions</td><td style="padding:10px 12px;text-align:right;">PKR ${formatNum(totalDeductions)}</td></tr>
        </tbody>
      </table>
    </div>` : ''}

    <!-- Slab-wise Tax Computation -->
    <div class="section">
      <div class="section-title">Slab-wise Tax Computation (${input.incomeHead === 'salary' ? 'Salaried' : 'Non-Salaried'})</div>
      <table>
        <thead><tr><th>Income Slab</th><th style="text-align:center;">Rate</th><th style="text-align:right;">Taxable Amount</th><th style="text-align:right;">Tax</th></tr></thead>
        <tbody>
          ${slabRows}
        </tbody>
      </table>
    </div>

    <!-- Tax Summary -->
    <div class="section">
      <div class="section-title">Tax Liability</div>
      <div class="summary-row"><span>Base Tax Computed</span><span>PKR ${formatNum(taxComputed)}</span></div>
      ${superTax > 0 ? `<div class="summary-row"><span>Super Tax (4%)</span><span>PKR ${formatNum(superTax)}</span></div>` : ''}
      ${minimumTax > 0 ? `<div class="summary-row"><span>Minimum Tax (1.25%)</span><span>PKR ${formatNum(minimumTax)}</span></div>` : ''}
      <div class="summary-row total"><span>Total Tax Payable</span><span>PKR ${formatNum(totalTax)}</span></div>
      <div style="margin-top:12px;text-align:right;font-size:13px;color:#6b7280;">Effective Tax Rate: <strong style="color:#059669;">${effectiveRate.toFixed(2)}%</strong></div>
    </div>

    <!-- Optimization Tips -->
    <div class="section">
      <div class="section-title">Tax Optimization Tips</div>
      <div class="tip-box">
        <h3>Ways to Reduce Your Tax Liability</h3>
        <ul>
          <li><strong>Sec 60:</strong> Invest up to 20% of taxable income in an approved pension fund.</li>
          <li><strong>Sec 61:</strong> Pay life insurance premiums — deductible up to 20% of income.</li>
          <li><strong>Sec 62:</strong> Pay Zakat through official channels — unlimited deduction.</li>
          <li><strong>Sec 64A:</strong> Donate to FBR-approved charities — up to 30% of income.</li>
          <li><strong>Sec 64C:</strong> Purchase computer/IT equipment — up to 3% of income.</li>
          ${input.incomeHead === 'salary' ? '<li><strong>Sec 63:</strong> Claim education allowance for children — up to 5% of income.</li>' : ''}
          ${input.incomeHead === 'salary' ? '<li><strong>Sec 64:</strong> Get health insurance — deductible up to 5% of income.</li>' : ''}
          ${input.incomeHead === 'business' ? '<li><strong>Business Expenses:</strong> Properly document all legitimate business expenses under Sec 20-22.</li>' : ''}
          ${input.incomeHead === 'property' ? '<li><strong>Sec 15A:</strong> Claim 1/5th of rent as repair/maintenance allowance.</li>' : ''}
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This report was generated by TaxMind Pakistan for reference purposes only.</p>
      <p>For official tax filing, please consult a qualified tax advisor or visit <strong>fbr.gov.pk</strong>.</p>
      <p style="margin-top:8px;">Tax Year ${calc.taxYear} · Computed on ${formatDate(calc.createdAt)} · Report ID: ${calc.id}</p>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`
}

// ─── Chart colors ──────────────────────────────────────────
const HEAD_CHART_COLORS: Record<string, string> = {
  salary: '#10b981',
  business: '#f59e0b',
  property: '#8b5cf6',
  capital_gains: '#f43f5e',
  other: '#64748b',
}

// ─── CSV Export Helper ────────────────────────────────────────
function downloadCSV(calcs: TaxCalculation[], filename = 'taxmind-calculations.csv') {
  const headers = ['Date', 'Income Head', 'Gross Income', 'Deductions', 'Taxable Income', 'Tax Computed', 'Super Tax', 'Total Tax', 'Effective Rate']
  const rows = calcs.map(c => [
    formatDateShort(c.createdAt),
    incomeHeadLabel(c.incomeHead),
    c.grossIncome,
    c.totalDeductions,
    c.taxableIncome,
    c.taxComputed,
    c.superTax,
    c.totalTax,
    `${c.effectiveRate.toFixed(2)}%`,
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => {
    const s = String(cell)
    return s.includes(',') || s.includes('"') || s.includes('%') ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Animation Variants ────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ─── Component ─────────────────────────────────────────────────
export default function TaxReports() {
  const setView = useAppStore((s) => s.setView)
  const storeUser = useAppStore((s) => s.user)

  const [calculations, setCalculations] = useState<TaxCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCalc, setSelectedCalc] = useState<TaxCalculation | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  // Date range filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // FBR JSON dialog state
  const [fbrJsonCalc, setFbrJsonCalc] = useState<TaxCalculation | null>(null)
  const [fbrJsonData, setFbrJsonData] = useState<object | null>(null)
  const [fbrJsonLoading, setFbrJsonLoading] = useState(false)

  const fetchCalculations = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tax/calculations')
      if (res.status === 401) {
        setView('login')
        return
      }
      if (!res.ok) {
        setError('Failed to load calculations.')
        return
      }
      const data = await res.json()
      setCalculations(data as TaxCalculation[])
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [setView])

  useEffect(() => {
    fetchCalculations()
  }, [fetchCalculations])

  // Filtered calculations
  const filteredCalculations = useMemo(() => {
    let result = calculations
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0)
      result = result.filter(c => new Date(c.createdAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
      result = result.filter(c => new Date(c.createdAt) <= to)
    }
    return result
  }, [calculations, dateFrom, dateTo])

  const hasActiveFilters = !!(dateFrom || dateTo)

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
  }

  // Chart data
  const headPieData = useMemo(() => {
    const g: Record<string, number> = {}
    for (const c of filteredCalculations) { g[c.incomeHead] = (g[c.incomeHead] || 0) + c.totalTax }
    return Object.entries(g).map(([h, v]) => ({ name: incomeHeadLabel(h), value: v, fill: HEAD_CHART_COLORS[h] || '#64748b' }))
  }, [filteredCalculations])

  const monthlyData = useMemo(() => {
    const g: Record<string, number> = {}
    for (const c of filteredCalculations) {
      const d = new Date(c.createdAt)
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      g[k] = (g[k] || 0) + c.totalTax
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([m, t]) => ({ m, t }))
  }, [filteredCalculations])

  // Bar chart data: gross vs taxable vs tax per calculation
  const barData = useMemo(() => {
    return filteredCalculations.slice(-10).map((c, i) => ({
      name: `${incomeHeadLabel(c.incomeHead).slice(0, 4)} ${i + 1}`,
      Gross: c.grossIncome,
      Taxable: c.taxableIncome,
      Tax: c.totalTax,
    }))
  }, [filteredCalculations])

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalGross = filteredCalculations.reduce((s, c) => s + c.grossIncome, 0)
    const totalTax = filteredCalculations.reduce((s, c) => s + c.totalTax, 0)
    const avgRate = filteredCalculations.length > 0
      ? filteredCalculations.reduce((s, c) => s + c.effectiveRate, 0) / filteredCalculations.length
      : 0
    return { totalGross, totalTax, avgRate, count: filteredCalculations.length }
  }, [filteredCalculations])

  // Generate Report
  function handleGenerateReport(calc: TaxCalculation) {
    setGeneratingReport(true)
    const html = generateReportHTML(calc, storeUser)
    const newWin = window.open('', '_blank')
    if (newWin) {
      newWin.document.write(html)
      newWin.document.close()
    }
    setTimeout(() => setGeneratingReport(false), 2000)
  }

  // ─── Download PDF (triggers print on report window) ───────
  function handleDownloadPDF(calc: TaxCalculation) {
    const html = generateReportHTML(calc, storeUser)
    const newWin = window.open('', '_blank')
    if (newWin) {
      newWin.document.write(html)
      newWin.document.close()
      // Wait for content to render then print
      newWin.onload = () => {
        setTimeout(() => {
          newWin.print()
        }, 500)
      }
    }
  }

  // Send to Calculator
  function handleSendToCalculator(calc: TaxCalculation) {
    const input = calc.inputJson as unknown as TaxInput
    sessionStorage.setItem('taxmind_report_input', JSON.stringify(input))
    setView('calculator')
  }

  // View FBR Return JSON
  function handleViewFBRJson(calc: TaxCalculation) {
    setFbrJsonCalc(calc)
    setFbrJsonLoading(true)
    setFbrJsonData(null)
    try {
      const input = calc.inputJson as unknown as TaxInput & { ntn?: string; cnic?: string; name?: string }
      const result: TaxResult = {
        grossIncome: calc.grossIncome, totalDeductions: calc.totalDeductions, taxableIncome: calc.taxableIncome,
        taxComputed: calc.taxComputed, superTax: calc.superTax, minimumTax: calc.minimumTax,
        totalTax: calc.totalTax, effectiveRate: calc.effectiveRate,
        breakdown: { incomeHead: calc.incomeHead, slabs: [], deductions: [] },
      }
      setFbrJsonData(generateFBRReturnData(result, input))
    } catch {
      setFbrJsonData(null)
    } finally {
      setFbrJsonLoading(false)
    }
  }

  // Export CSV
  function handleExportCSV() {
    if (filteredCalculations.length === 0) return
    downloadCSV(filteredCalculations)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Tax Reports
              </h1>
              <p className="mt-1 text-muted-foreground">
                Review past calculations, generate reports, and export data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className={showFilters ? 'bg-primary/10 border-primary/30 text-primary' : ''}>
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredCalculations.length === 0}>
                <TableProperties className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => setView('calculator')}>
                <Calculator className="mr-2 h-4 w-4" />
                New Calculation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ─── Date Range Filter ─────────────────────────── */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-primary/20 bg-primary/[0.02]">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="max-w-[220px]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="max-w-[220px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="mr-1 h-3.5 w-3.5" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                {hasActiveFilters && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Showing {filteredCalculations.length} of {calculations.length} calculations
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Error State ──────────────────────────────── */}
        {error && !loading && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchCalculations}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── Loading State ────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ─── Empty State ──────────────────────────────── */}
        {!loading && !error && calculations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileBarChart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Reports Yet</h3>
                <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                  Perform a tax calculation first. Your computation history will appear here with options to generate detailed reports.
                </p>
                <Button className="mt-6" onClick={() => setView('calculator')}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Start Your First Calculation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Filtered Empty State ─────────────────────── */}
        {!loading && !error && calculations.length > 0 && filteredCalculations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Filter className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Matching Results</h3>
                <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                  No calculations found for the selected date range. Try adjusting your filters.
                </p>
                <Button className="mt-6" variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Calculations List & Charts ────────────────── */}
        {!loading && !error && filteredCalculations.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* ─── Summary Stats Cards ──────────────────── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-primary/20">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground">Total Gross Income</p>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(summaryStats.totalGross)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Across {summaryStats.count} calculation{summaryStats.count !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground">Total Tax Liability</p>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrency(summaryStats.totalTax)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Combined tax payable</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground">Average Effective Rate</p>
                  <p className="mt-1 text-xl font-bold text-primary">{summaryStats.avgRate.toFixed(1)}%</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Across all filtered calculations</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* ─── Charts Section ────────────────────────── */}
            {filteredCalculations.length > 1 && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Income Head Pie Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PieChartIcon className="h-4 w-4 text-primary" />
                      Tax by Income Head
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={headPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={2}
                          >
                            {headPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                            }}
                          />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Trend Area Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Monthly Tax Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="m" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Tax']}
                            labelFormatter={(label) => `Period: ${label}`}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="t"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#taxGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart: Gross vs Taxable vs Tax */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Income vs Tax Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="Gross" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Taxable" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Tax" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Mobile Cards View */}
            <div className="block space-y-3 sm:hidden">
              {filteredCalculations.map((calc) => (
                <motion.div key={calc.id} variants={itemVariants}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={incomeHeadColor(calc.incomeHead)}
                          >
                            {incomeHeadLabel(calc.incomeHead)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            TY {calc.taxYear}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium">
                          Gross: {formatCurrency(calc.grossIncome)}
                        </p>
                        <p className="text-sm text-primary font-semibold">
                          Tax: {formatCurrency(calc.totalTax)}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({calc.effectiveRate.toFixed(1)}%)
                          </span>
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(calc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCalc(calc)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateReport(calc)}
                        disabled={generatingReport}
                      >
                        {generatingReport ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="mr-1 h-3.5 w-3.5" />}
                        Report
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(calc)}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary"
                        onClick={() => handleViewFBRJson(calc)}
                      >
                        <FileJson className="mr-1 h-3.5 w-3.5" />
                        FBR JSON
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendToCalculator(calc)}
                      >
                        <Calculator className="mr-1 h-3.5 w-3.5" />
                        Re-calc
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">All Calculations</CardTitle>
                    <CardDescription>
                      {filteredCalculations.length} calculation{filteredCalculations.length !== 1 ? 's' : ''} on record
                      {hasActiveFilters && ` (filtered from ${calculations.length})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[520px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Tax Year</TableHead>
                            <TableHead>Income Head</TableHead>
                            <TableHead className="text-right">Gross Income</TableHead>
                            <TableHead className="text-right">Taxable Income</TableHead>
                            <TableHead className="text-right">Total Tax</TableHead>
                            <TableHead className="text-right">Eff. Rate</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCalculations.map((calc) => (
                            <TableRow key={calc.id}>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(calc.createdAt)}
                              </TableCell>
                              <TableCell className="font-medium whitespace-nowrap">
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
                              <TableCell className="text-right font-mono text-sm whitespace-nowrap">
                                {formatCurrency(calc.grossIncome)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm whitespace-nowrap">
                                {formatCurrency(calc.taxableIncome)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm font-semibold whitespace-nowrap">
                                {formatCurrency(calc.totalTax)}
                              </TableCell>
                              <TableCell className="text-right text-sm whitespace-nowrap">
                                {calc.effectiveRate.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => setSelectedCalc(calc)}
                                    title="View details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => handleGenerateReport(calc)}
                                    disabled={generatingReport}
                                    title="Generate report"
                                  >
                                    {generatingReport ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => handleDownloadPDF(calc)}
                                    title="Download PDF"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-primary"
                                    onClick={() => handleViewFBRJson(calc)}
                                    title="View FBR Return JSON"
                                  >
                                    <FileJson className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => handleSendToCalculator(calc)}
                                    title="Send to Calculator"
                                  >
                                    <Calculator className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─── Detail Dialog ────────────────────────────── */}
        <Dialog open={!!selectedCalc} onOpenChange={(open) => !open && setSelectedCalc(null)}>
          {selectedCalc && (
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Calculation Details</DialogTitle>
                <DialogDescription>
                  Tax Year {selectedCalc.taxYear} — {incomeHeadLabel(selectedCalc.incomeHead)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem label="Gross Income" value={formatCurrency(selectedCalc.grossIncome)} />
                  <DetailItem label="Total Deductions" value={formatCurrency(selectedCalc.totalDeductions)} />
                  <DetailItem label="Taxable Income" value={formatCurrency(selectedCalc.taxableIncome)} highlight />
                  <DetailItem label="Base Tax" value={formatCurrency(selectedCalc.taxComputed)} />
                  {selectedCalc.superTax > 0 && (
                    <DetailItem label="Super Tax" value={formatCurrency(selectedCalc.superTax)} />
                  )}
                  {selectedCalc.minimumTax > 0 && (
                    <DetailItem label="Minimum Tax" value={formatCurrency(selectedCalc.minimumTax)} />
                  )}
                  <DetailItem label="Total Tax Payable" value={formatCurrency(selectedCalc.totalTax)} highlight />
                  <DetailItem label="Effective Rate" value={`${selectedCalc.effectiveRate.toFixed(2)}%`} highlight />
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleGenerateReport(selectedCalc)}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Generate Report
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(selectedCalc)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download PDF
                  </Button>
                  <Button size="sm" variant="outline" className="text-primary" onClick={() => {
                    handleViewFBRJson(selectedCalc)
                  }}>
                    <FileJson className="mr-1.5 h-3.5 w-3.5" />
                    View FBR Return JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSendToCalculator(selectedCalc)}>
                    <Calculator className="mr-1.5 h-3.5 w-3.5" />
                    Send to Calculator
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ─── FBR Return JSON Dialog ───────────────────── */}
        <Dialog open={!!fbrJsonCalc} onOpenChange={(open) => !open && setFbrJsonCalc(null)}>
          {fbrJsonCalc && (
            <DialogContent className="max-w-2xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  FBR Return JSON
                </DialogTitle>
                <DialogDescription>
                  Tax Year {fbrJsonCalc.taxYear} — {incomeHeadLabel(fbrJsonCalc.incomeHead)} · Generated for preview
                </DialogDescription>
              </DialogHeader>

              <div className="pt-2">
                {fbrJsonLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Generating FBR return data…</span>
                  </div>
                ) : fbrJsonData ? (
                  <ScrollArea className="h-[60vh] rounded-lg border bg-muted/50">
                    <pre className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-all">
                      <code>{JSON.stringify(fbrJsonData, null, 2)}</code>
                    </pre>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p className="mt-2 text-sm font-medium">Failed to generate FBR return data</p>
                    <p className="mt-1 text-xs text-muted-foreground">The calculation data may be incomplete or in an unexpected format.</p>
                  </div>
                )}

                {!fbrJsonLoading && fbrJsonData && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(fbrJsonData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `fbr-return-${fbrJsonCalc.taxYear}-${fbrJsonCalc.id.slice(0, 8)}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(fbrJsonData, null, 2))
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  )
}

// ─── Sub-component ─────────────────────────────────────────────
function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  )
}

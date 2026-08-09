'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Building2,
  Home,
  TrendingUp,
  Wallet,
  Lightbulb,
  Loader2,
  FileBarChart,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  IndianRupee,
  Info,
  PiggyBank,
  AlertTriangle,
  Receipt,
  FileJson,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  DEDUCTION_SECTIONS,
  TAX_OPTIMIZATION_STRATEGIES,
  calculateTax,
  formatPKR as engineFormatPKR,
  calculateWithholdingTax,
  generateFBRReturnData,
  calculateCapitalGainsTax,
  filerNonFilerSurcharge,
  type IncomeHead,
  type TaxResult,
} from '@/lib/tax-engine'
import { useAppStore } from '@/store/app'

// ─── Constants ────────────────────────────────────────────────────────────
const INCOME_HEADS: { value: IncomeHead; label: string; icon: typeof Briefcase }[] = [
  { value: 'salary', label: 'Salary', icon: Wallet },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'property', label: 'Property', icon: Home },
  { value: 'capital_gains', label: 'Capital Gains', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: Building2 },
]

const TAX_YEAR = '2024-2025'

const DEDUCTION_FIELD_MAP: Record<string, string> = {
  'Sec 60': 'sec60InvestmentPension',
  'Sec 61': 'sec61LifeInsurance',
  'Sec 62': 'sec62Zakat',
  'Sec 63': 'sec63Education',
  'Sec 64': 'sec64HealthInsurance',
  'Sec 64A': 'sec64ACharity',
  'Sec 64B': 'sec64BDomesticTravel',
  'Sec 64C': 'sec64CComputerIT',
  'Sec 64D': 'sec64DEmployerProvidentFund',
  'Sec 64E': 'sec64EEmployeeOldAge',
}

const WHT_TYPES_DISPLAY: { key: string; label: string; icon: string }[] = [
  { key: 'bankProfit', label: 'Bank Profit / Profit on Debt', icon: '🏦' },
  { key: 'dividend', label: 'Dividend Income', icon: '📈' },
  { key: 'services', label: 'Services / Consultancy Fees', icon: '💼' },
  { key: 'contract', label: 'Contract Payments', icon: '📝' },
  { key: 'propertyRent', label: 'Property Rent', icon: '🏠' },
  { key: 'prizeWinnings', label: 'Prize Winnings / Lottery', icon: '🎰' },
  { key: 'professionalFee', label: 'Professional Fees', icon: '👨‍💼' },
  { key: 'educationFeePrivate', label: 'Private Education Fee', icon: '🎓' },
  { key: 'electricity', label: 'Electricity Bills', icon: '⚡' },
  { key: 'vehiclePurchase', label: 'Vehicle Purchase', icon: '🚗' },
]

// ─── Zod Schema ────────────────────────────────────────────────────────────
const deductionKeys = Object.values(DEDUCTION_FIELD_MAP)

const taxFormSchema = z.object({
  incomeHead: z.enum(['salary', 'business', 'property', 'capital_gains', 'other'] as const),
  grossIncome: z.coerce.number({ message: 'Must be a valid number' }).positive('Income must be greater than 0'),
  // Deductions
  sec60InvestmentPension: z.coerce.number().min(0).optional().default(0),
  sec61LifeInsurance: z.coerce.number().min(0).optional().default(0),
  sec62Zakat: z.coerce.number().min(0).optional().default(0),
  sec63Education: z.coerce.number().min(0).optional().default(0),
  sec64HealthInsurance: z.coerce.number().min(0).optional().default(0),
  sec64ACharity: z.coerce.number().min(0).optional().default(0),
  sec64BDomesticTravel: z.coerce.number().min(0).optional().default(0),
  sec64CComputerIT: z.coerce.number().min(0).optional().default(0),
  sec64DEmployerProvidentFund: z.coerce.number().min(0).optional().default(0),
  sec64EEmployeeOldAge: z.coerce.number().min(0).optional().default(0),
  // Deduction toggles
  deductionEnabled: z.record(z.boolean()).optional().default({}),
  // Business specific (enhanced)
  cogs: z.coerce.number().min(0).optional().default(0),
  depreciation: z.coerce.number().min(0).optional().default(0),
  otherBusinessExpenses: z.coerce.number().min(0).optional().default(0),
  // Property specific (enhanced)
  propertyExpenses: z.coerce.number().min(0).optional().default(0),
  propertyType: z.enum(['rent', 'capital_value']).optional(),
  repairAllowance: z.boolean().optional().default(false),
  // Capital gains specific
  holdingPeriodMonths: z.coerce.number().min(0).optional().default(0),
  assetType: z.enum(['securities', 'immovable_property', 'other']).optional(),
  // Filer status
  isFiler: z.boolean().optional().default(true),
})

type TaxFormData = z.infer<typeof taxFormSchema>

// ─── Animation Variants ────────────────────────────────────────────────────
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

const resultVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function pkr(amount: number): string {
  return `PKR ${engineFormatPKR(Math.round(amount))}`
}

function getDeductionLimitText(section: typeof DEDUCTION_SECTIONS[number]): string {
  if (section.maxLimit === 0) return 'No upper limit'
  return `Up to ${(section.maxLimit * 100).toFixed(0)}% of taxable income`
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TaxCalculator() {
  const { setView } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<(TaxResult & { id?: string }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deductionsOpen, setDeductionsOpen] = useState(false)
  const [optimizationsOpen, setOptimizationsOpen] = useState(false)
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null)
  const [whtDialogOpen, setWhtDialogOpen] = useState(false)
  const [fbrDialogOpen, setFbrDialogOpen] = useState(false)
  const [fbrJson, setFbrJson] = useState<string>('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      incomeHead: 'salary',
      grossIncome: undefined,
      deductionEnabled: {},
      cogs: 0,
      depreciation: 0,
      otherBusinessExpenses: 0,
      propertyExpenses: 0,
      holdingPeriodMonths: 0,
      repairAllowance: false,
      isFiler: true,
    },
  })

  const selectedHead = watch('incomeHead')
  const grossIncome = watch('grossIncome') || 0
  const deductionEnabled = watch('deductionEnabled') || {}
  const isFiler = watch('isFiler') ?? true

  // Business-specific watches
  const cogs = watch('cogs') || 0
  const depreciation = watch('depreciation') || 0
  const otherBusinessExpenses = watch('otherBusinessExpenses') || 0

  // Property-specific watches
  const propertyExpenses = watch('propertyExpenses') || 0
  const repairAllowance = watch('repairAllowance') ?? false

  // Capital gains watches
  const holdingPeriodMonths = watch('holdingPeriodMonths') || 0
  const assetType = watch('assetType') || 'securities'

  // ── Computed values ──
  const netBusinessIncome = useMemo(
    () => Math.max(0, grossIncome - cogs - depreciation - otherBusinessExpenses),
    [grossIncome, cogs, depreciation, otherBusinessExpenses]
  )

  const repairAllowanceAmount = useMemo(
    () => (repairAllowance && grossIncome > 0 ? Math.round(grossIncome * 0.2) : 0),
    [repairAllowance, grossIncome]
  )

  const netPropertyIncome = useMemo(
    () => Math.max(0, grossIncome - repairAllowanceAmount - propertyExpenses),
    [grossIncome, repairAllowanceAmount, propertyExpenses]
  )

  const cgtResult = useMemo(() => {
    if (selectedHead !== 'capital_gains' || grossIncome <= 0) return null
    return calculateCapitalGainsTax(grossIncome, holdingPeriodMonths, assetType)
  }, [selectedHead, grossIncome, holdingPeriodMonths, assetType])

  // ── WHT calculations ──
  const whtCalculations = useMemo(() => {
    if (grossIncome <= 0) return []
    return WHT_TYPES_DISPLAY.map((wht) => {
      try {
        const res = calculateWithholdingTax(wht.key, grossIncome)
        const surcharge = filerNonFilerSurcharge(grossIncome, isFiler)
        return {
          ...wht,
          rate: res.rate,
          tax: res.tax,
          section: res.section,
          surcharge,
          totalTax: res.tax + surcharge,
        }
      } catch {
        return { ...wht, rate: 0, tax: 0, section: '-', surcharge: 0, totalTax: 0 }
      }
    })
  }, [grossIncome, isFiler])

  // Pre-fill from scanner data
  useEffect(() => {
    try {
      const scannerData = sessionStorage.getItem('scannerData')
      if (scannerData) {
        const data = JSON.parse(scannerData)
        if (data.incomeHead) setValue('incomeHead', data.incomeHead)
        if (data.grossIncome) setValue('grossIncome', data.grossIncome)
        if (data.businessExpenses) setValue('otherBusinessExpenses', data.businessExpenses)
        if (data.propertyExpenses) setValue('propertyExpenses', data.propertyExpenses)
        if (data.propertyType) setValue('propertyType', data.propertyType)
        if (data.holdingPeriodMonths) setValue('holdingPeriodMonths', data.holdingPeriodMonths)
        if (data.cogs) setValue('cogs', data.cogs)
        if (data.depreciation) setValue('depreciation', data.depreciation)
        if (data.isFiler !== undefined) setValue('isFiler', data.isFiler)
        // Pre-fill deductions
        for (const section of DEDUCTION_SECTIONS) {
          const fieldName = DEDUCTION_FIELD_MAP[section.section]
          if (fieldName && data[fieldName]) {
            setValue(fieldName as keyof TaxFormData, data[fieldName])
            setValue('deductionEnabled', (prev: Record<string, boolean> = {}) => ({
              ...prev,
              [section.section]: true,
            }))
          }
        }
        sessionStorage.removeItem('scannerData')
      }
    } catch {
      // Ignore parsing errors
    }
  }, [setValue])

  const onSubmit = useCallback(async (data: TaxFormData) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Compute effective gross income based on head-specific deductions
      let effectiveGrossIncome = data.grossIncome

      if (data.incomeHead === 'business') {
        effectiveGrossIncome = Math.max(
          0,
          data.grossIncome - (data.cogs || 0) - (data.depreciation || 0) - (data.otherBusinessExpenses || 0)
        )
      }

      if (data.incomeHead === 'property') {
        const repairAmt = data.repairAllowance ? Math.round(data.grossIncome * 0.2) : 0
        effectiveGrossIncome = Math.max(0, data.grossIncome - repairAmt - (data.propertyExpenses || 0))
      }

      // Build payload
      const payload: Record<string, unknown> = {
        incomeHead: data.incomeHead,
        taxYear: TAX_YEAR,
        grossIncome: effectiveGrossIncome,
        isFiler: data.isFiler,
      }

      for (const section of DEDUCTION_SECTIONS) {
        const fieldName = DEDUCTION_FIELD_MAP[section.section]
        if (fieldName && data.deductionEnabled?.[section.section]) {
          const val = data[fieldName as keyof TaxFormData]
          if (val && Number(val) > 0) {
            payload[fieldName] = Number(val)
          }
        }
      }

      // Head-specific fields
      if (data.incomeHead === 'business') {
        payload.businessExpenses = (data.cogs || 0) + (data.depreciation || 0) + (data.otherBusinessExpenses || 0)
        payload.cogs = data.cogs || 0
        payload.depreciation = data.depreciation || 0
      }
      if (data.incomeHead === 'property') {
        payload.propertyExpenses = data.propertyExpenses || 0
        if (data.propertyType) payload.propertyType = data.propertyType
        if (data.repairAllowance) payload.propertyRepairAllowance = Math.round(data.grossIncome * 0.2)
      }
      if (data.incomeHead === 'capital_gains') {
        payload.holdingPeriodMonths = data.holdingPeriodMonths || 0
        if (data.assetType) payload.assetType = data.assetType
      }

      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server error (${response.status})`)
      }

      const resultData = await response.json()
      setResult(resultData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    reset()
    setResult(null)
    setError(null)
    setDeductionsOpen(false)
    setOptimizationsOpen(false)
    setWhtDialogOpen(false)
    setFbrDialogOpen(false)
    setFbrJson('')
  }, [reset])

  const handleViewFBRReturn = useCallback(() => {
    if (!result) return
    try {
      const fbrData = generateFBRReturnData(result, {
        incomeHead: selectedHead,
        taxYear: TAX_YEAR,
        grossIncome: result.grossIncome,
        isFiler,
      })
      setFbrJson(JSON.stringify(fbrData, null, 2))
      setFbrDialogOpen(true)
    } catch (err) {
      setFbrJson(`Error generating FBR return: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setFbrDialogOpen(true)
    }
  }, [result, selectedHead, isFiler])

  const filteredStrategies = TAX_OPTIMIZATION_STRATEGIES.filter((s) =>
    s.applicableTo.includes(selectedHead)
  )

  const activeHeadConfig = INCOME_HEADS.find((h) => h.value === selectedHead)
  const totalDeductionsEnabled = Object.values(deductionEnabled).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('dashboard')}
              className="text-emerald-700 hover:bg-emerald-100"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl">
                Tax Calculator
              </h1>
              <p className="text-sm text-emerald-600">
                FBR Tax Year {TAX_YEAR} — Pakistan
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-300 bg-emerald-50 text-emerald-700"
          >
            TY {TAX_YEAR}
          </Badge>
        </motion.div>

        {/* ── Filer Status Toggle ─────────────────────────────────── */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card className="border-emerald-200/60 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between py-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                {isFiler ? (
                  <ShieldCheck className="size-6 text-emerald-600" />
                ) : (
                  <ShieldX className="size-6 text-red-500" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isFiler" className="text-sm font-semibold text-emerald-900">
                      Filer Status
                    </Label>
                    <Badge className={isFiler ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}>
                      {isFiler ? 'Active Taxpayer (ATL)' : 'Non-Filer'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isFiler
                      ? 'You are on the Active Taxpayer List and benefit from standard WHT rates.'
                      : '⚠ Non-filers pay 2× the normal withholding tax rates on all transactions under ITO 2001 Sections 147-236.'}
                  </p>
                </div>
              </div>
              <Controller
                name="isFiler"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isFiler"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          {/* ── Step 1: Income Head Selector ─────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200/60 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <Sparkles className="size-5 text-emerald-600" />
                  Select Income Head
                </CardTitle>
                <CardDescription>
                  Choose the primary source of income for accurate tax computation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="incomeHead"
                  control={control}
                  render={({ field }) => (
                    <Tabs
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                      className="w-full"
                    >
                      <TabsList className="flex w-full flex-wrap gap-1 bg-emerald-100/60 p-1 sm:w-fit">
                        {INCOME_HEADS.map((head) => {
                          const Icon = head.icon
                          return (
                            <TabsTrigger
                              key={head.value}
                              value={head.value}
                              className="flex items-center gap-1.5 px-3 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                            >
                              <Icon className="size-3.5 sm:size-4" />
                              <span className="hidden sm:inline">{head.label}</span>
                              <span className="sm:hidden">{head.label.slice(0, 4)}</span>
                            </TabsTrigger>
                          )
                        })}
                      </TabsList>
                    </Tabs>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Step 2: Income Input ────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200/60 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <IndianRupee className="size-5 text-emerald-600" />
                  Income Details
                </CardTitle>
                <CardDescription>
                  Enter your gross annual income{activeHeadConfig ? ` from ${activeHeadConfig.label.toLowerCase()} sources` : ''}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Gross Income - Large prominent input */}
                <div className="space-y-2">
                  <Label htmlFor="grossIncome" className="text-base font-semibold text-emerald-900">
                    Gross Annual Income (PKR)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-emerald-600">
                      PKR
                    </span>
                    <Input
                      id="grossIncome"
                      type="number"
                      placeholder="e.g. 2,500,000"
                      className="h-14 border-emerald-300 bg-emerald-50/30 pl-12 text-lg font-semibold placeholder:text-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-200"
                      {...register('grossIncome')}
                    />
                  </div>
                  {errors.grossIncome && (
                    <p className="text-sm text-red-500">{String(errors.grossIncome.message)}</p>
                  )}
                  {grossIncome > 0 && (
                    <p className="text-xs text-emerald-600">
                      {pkr(grossIncome)} = {pkr(grossIncome / 12)} / month
                    </p>
                  )}
                </div>

                <Separator className="bg-emerald-100" />

                {/* ── Business-specific fields (Enhanced) ── */}
                {selectedHead === 'business' && (
                  <div className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="size-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Business Income Adjustments</span>
                    </div>
                    <p className="text-xs text-emerald-600">
                      Deductible costs are subtracted from gross to compute net business income (ITO Sec 20-22).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cogs" className="text-sm font-medium text-emerald-800">
                          Cost of Goods Sold (PKR)
                        </Label>
                        <Input
                          id="cogs"
                          type="number"
                          placeholder="e.g. 800,000"
                          className="border-emerald-200 bg-white"
                          {...register('cogs')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depreciation" className="text-sm font-medium text-emerald-800">
                          Depreciation (PKR)
                        </Label>
                        <Input
                          id="depreciation"
                          type="number"
                          placeholder="e.g. 200,000"
                          className="border-emerald-200 bg-white"
                          {...register('depreciation')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otherBusinessExpenses" className="text-sm font-medium text-emerald-800">
                          Other Business Expenses (PKR)
                        </Label>
                        <Input
                          id="otherBusinessExpenses"
                          type="number"
                          placeholder="e.g. 300,000"
                          className="border-emerald-200 bg-white"
                          {...register('otherBusinessExpenses')}
                        />
                      </div>
                    </div>

                    {grossIncome > 0 && (
                      <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Gross Income</span>
                          <span>{pkr(grossIncome)}</span>
                        </div>
                        {cogs > 0 && (
                          <div className="flex items-center justify-between text-xs text-red-600">
                            <span>− Cost of Goods Sold</span>
                            <span>{pkr(cogs)}</span>
                          </div>
                        )}
                        {depreciation > 0 && (
                          <div className="flex items-center justify-between text-xs text-red-600">
                            <span>− Depreciation</span>
                            <span>{pkr(depreciation)}</span>
                          </div>
                        )}
                        {otherBusinessExpenses > 0 && (
                          <div className="flex items-center justify-between text-xs text-red-600">
                            <span>− Other Expenses</span>
                            <span>{pkr(otherBusinessExpenses)}</span>
                          </div>
                        )}
                        <Separator className="bg-emerald-200" />
                        <div className="flex items-center justify-between text-sm font-bold text-emerald-800">
                          <span>Net Business Income</span>
                          <span>{pkr(netBusinessIncome)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Property-specific fields (Enhanced) ── */}
                {selectedHead === 'property' && (
                  <div className="flex flex-col gap-4 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="size-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Property Income Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-emerald-800">
                          Property Type
                        </Label>
                        <Controller
                          name="propertyType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value || ''}
                              onValueChange={(v) => field.onChange(v as 'rent' | 'capital_value')}
                            >
                              <SelectTrigger className="w-full border-emerald-200 bg-white">
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rent">Rental Income</SelectItem>
                                <SelectItem value="capital_value">Capital Value (Immovable Property)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyExpenses" className="text-sm font-medium text-emerald-800">
                          Actual Property Expenses (PKR)
                        </Label>
                        <Input
                          id="propertyExpenses"
                          type="number"
                          placeholder="e.g. 100,000"
                          className="border-emerald-200 bg-white"
                          {...register('propertyExpenses')}
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-white p-3">
                      <Controller
                        name="repairAllowance"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="repairAllowance"
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            className="mt-0.5 border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                        )}
                      />
                      <div className="flex-1">
                        <Label htmlFor="repairAllowance" className="text-sm font-medium text-emerald-800 cursor-pointer">
                          Repair & Maintenance Allowance (1/5 of Gross Rent)
                        </Label>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Under ITO Sec 15A, 1/5 (20%) of gross rent is automatically allowed as repair allowance regardless of actual expenditure.
                        </p>
                        {repairAllowance && grossIncome > 0 && (
                          <p className="text-xs font-semibold text-emerald-700 mt-1">
                            Repair Allowance: {pkr(repairAllowanceAmount)} (20% of {pkr(grossIncome)})
                          </p>
                        )}
                      </div>
                    </div>

                    {grossIncome > 0 && (
                      <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Gross Rent / Property Income</span>
                          <span>{pkr(grossIncome)}</span>
                        </div>
                        {repairAllowance && repairAllowanceAmount > 0 && (
                          <div className="flex items-center justify-between text-xs text-red-600">
                            <span>− Repair Allowance (1/5 = 20%)</span>
                            <span>{pkr(repairAllowanceAmount)}</span>
                          </div>
                        )}
                        {propertyExpenses > 0 && (
                          <div className="flex items-center justify-between text-xs text-red-600">
                            <span>− Actual Property Expenses</span>
                            <span>{pkr(propertyExpenses)}</span>
                          </div>
                        )}
                        <Separator className="bg-emerald-200" />
                        <div className="flex items-center justify-between text-sm font-bold text-emerald-800">
                          <span>Net Property Income</span>
                          <span>{pkr(netPropertyIncome)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Capital Gains fields (Enhanced) ── */}
                {selectedHead === 'capital_gains' && (
                  <div className="flex flex-col gap-4 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="size-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Capital Gains Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-emerald-800">
                          Asset Type
                        </Label>
                        <Controller
                          name="assetType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value || ''}
                              onValueChange={(v) =>
                                field.onChange(v as 'securities' | 'immovable_property' | 'other')
                              }
                            >
                              <SelectTrigger className="w-full border-emerald-200 bg-white">
                                <SelectValue placeholder="Select asset type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="securities">Listed Securities</SelectItem>
                                <SelectItem value="immovable_property">Immovable Property</SelectItem>
                                <SelectItem value="other">Other Assets</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holdingPeriodMonths" className="text-sm font-medium text-emerald-800">
                          Holding Period (Months)
                        </Label>
                        <Input
                          id="holdingPeriodMonths"
                          type="number"
                          placeholder="e.g. 24"
                          className="border-emerald-200 bg-white"
                          {...register('holdingPeriodMonths')}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-emerald-600">
                      Longer holding periods may qualify for reduced CGT rates under ITO Sec 37-38.
                    </p>

                    {/* CGT Rate Display */}
                    {cgtResult && grossIncome > 0 && (
                      <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-900">Capital Gains Tax Rate</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Applicable CGT Rate</span>
                          <Badge className={cgtResult.rate === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {cgtResult.rate === 0 ? 'Exempt' : `${(cgtResult.rate * 100).toFixed(1)}%`}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Estimated CGT</span>
                          <span className="text-sm font-bold text-emerald-800">{pkr(cgtResult.tax)}</span>
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">
                          {cgtResult.holdingPeriodDiscount}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Step 3: Deductions ─────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200/60 bg-white shadow-sm">
              <CardHeader
                className="cursor-pointer select-none pb-3"
                onClick={() => setDeductionsOpen(!deductionsOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="size-5 text-emerald-600" />
                    <CardTitle className="text-lg text-emerald-900">Deductions</CardTitle>
                    {totalDeductionsEnabled > 0 && (
                      <Badge className="bg-emerald-600 text-white">
                        {totalDeductionsEnabled} active
                      </Badge>
                    )}
                  </div>
                  {deductionsOpen ? (
                    <ChevronUp className="size-5 text-emerald-500" />
                  ) : (
                    <ChevronDown className="size-5 text-emerald-500" />
                  )}
                </div>
                <CardDescription>
                  Enable applicable ITO 2001 deduction sections to reduce taxable income.
                </CardDescription>
              </CardHeader>

              <AnimatePresence>
                {deductionsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0">
                      <div className="max-h-96 overflow-y-auto pr-1 space-y-1">
                        {DEDUCTION_SECTIONS.map((section) => {
                          const fieldName = DEDUCTION_FIELD_MAP[section.section]
                          const isEnabled = !!deductionEnabled[section.section]

                          return (
                            <div
                              key={section.section}
                              className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
                                isEnabled
                                  ? 'border-emerald-300 bg-emerald-50/50'
                                  : 'border-transparent bg-muted/30 hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Controller
                                  name="deductionEnabled"
                                  control={control}
                                  render={({ field: ctrlField }) => (
                                    <Checkbox
                                      checked={!!ctrlField.value?.[section.section]}
                                      onCheckedChange={(checked) => {
                                        ctrlField.onChange({
                                          ...ctrlField.value,
                                          [section.section]: !!checked,
                                        })
                                        if (!checked && fieldName) {
                                          setValue(fieldName as keyof TaxFormData, 0)
                                        }
                                      }}
                                      className="mt-0.5 border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                  )}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-emerald-900">
                                      {section.section}: {section.title}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5">
                                      {section.itoRef}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {getDeductionLimitText(section)}
                                  </p>
                                </div>
                              </div>

                              {isEnabled && fieldName && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="ml-7"
                                >
                                  <Input
                                    type="number"
                                    placeholder="Amount in PKR"
                                    className="h-9 border-emerald-200 bg-white text-sm"
                                    {...register(fieldName as keyof TaxFormData)}
                                  />
                                </motion.div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* ── Step 4: Optimization Strategies ───────────────────── */}
          <motion.div variants={itemVariants}>
            <Card className="border-emerald-200/60 bg-white shadow-sm">
              <CardHeader
                className="cursor-pointer select-none pb-3"
                onClick={() => setOptimizationsOpen(!optimizationsOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-emerald-600" />
                    <CardTitle className="text-lg text-emerald-900">
                      Tax Optimization Strategies
                    </CardTitle>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      {filteredStrategies.length} tips
                    </Badge>
                  </div>
                  {optimizationsOpen ? (
                    <ChevronUp className="size-5 text-emerald-500" />
                  ) : (
                    <ChevronDown className="size-5 text-emerald-500" />
                  )}
                </div>
                <CardDescription>
                  Legal strategies under ITO 2001 to minimize your tax liability.
                </CardDescription>
              </CardHeader>

              <AnimatePresence>
                {optimizationsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0">
                      <div className="max-h-96 overflow-y-auto pr-1">
                        <Accordion type="multiple" className="space-y-1">
                          {filteredStrategies.map((strategy) => (
                            <AccordionItem
                              key={strategy.id}
                              value={`strategy-${strategy.id}`}
                              className="rounded-lg border border-emerald-100 px-3 data-[state=open]:bg-emerald-50/50"
                            >
                              <AccordionTrigger
                                onClick={() =>
                                  setExpandedStrategy(
                                    expandedStrategy === `strategy-${strategy.id}`
                                      ? null
                                      : `strategy-${strategy.id}`
                                  )
                                }
                                className="hover:no-underline py-3"
                              >
                                <div className="flex flex-col items-start gap-1 text-left">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-emerald-900">
                                      {strategy.title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-300 text-emerald-700 text-[10px] px-1.5"
                                    >
                                      {strategy.section}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {strategy.description}
                                  </p>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-col gap-2 pl-0">
                                  <p className="text-sm text-emerald-800 leading-relaxed">
                                    {strategy.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Info className="size-3.5 text-emerald-500" />
                                    <span className="text-xs text-emerald-600">
                                      Applicable to:{' '}
                                      {strategy.applicableTo
                                        .map((h) => INCOME_HEADS.find((ih) => ih.value === h)?.label || h)
                                        .join(', ')}
                                    </span>
                                  </div>
                                  <Badge className="w-fit bg-emerald-100 text-emerald-700 border-emerald-200">
                                    Potential Saving: {strategy.potentialSaving}
                                  </Badge>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* ── Action Buttons ────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 bg-emerald-600 text-base font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-60"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Calculating Tax...
                </>
              ) : (
                <>
                  <Calculator className="size-5" />
                  Calculate Tax
                </>
              )}
            </Button>
            <Dialog open={whtDialogOpen} onOpenChange={setWhtDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  size="lg"
                  onClick={() => setWhtDialogOpen(true)}
                >
                  <Receipt className="size-5" />
                  Calculate WHT
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-emerald-900">
                    <Receipt className="size-5 text-emerald-600" />
                    Withholding Tax Calculator
                  </DialogTitle>
                  <DialogDescription>
                    Common WHT types applicable to your income of {pkr(grossIncome)}.
                    {isFiler
                      ? ' Rates shown are for Active Taxpayers (ATL).'
                      : ' ⚠ Non-filer rates are doubled (2×) per ITO 2001.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-emerald-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-emerald-50">
                      <TableRow className="border-emerald-200">
                        <TableHead className="text-emerald-800 font-semibold">WHT Type</TableHead>
                        <TableHead className="text-emerald-800 font-semibold text-center">Section</TableHead>
                        <TableHead className="text-emerald-800 font-semibold text-right">Rate</TableHead>
                        <TableHead className="text-emerald-800 font-semibold text-right">WHT Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {whtCalculations.map((wht, idx) => (
                        <TableRow key={wht.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}>
                          <TableCell className="text-sm font-medium">
                            <span className="mr-1.5">{wht.icon}</span>
                            {wht.label}
                          </TableCell>
                          <TableCell className="text-sm text-center text-muted-foreground">{wht.section}</TableCell>
                          <TableCell className="text-sm text-right font-mono">
                            {wht.rate === 0 ? 'N/A' : `${(wht.rate * 100).toFixed(1)}%`}
                            {!isFiler && wht.rate > 0 && (
                              <span className="ml-1 text-[10px] text-red-500">(2×)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">{pkr(wht.totalTax)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter className="bg-emerald-100 border-emerald-200">
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold text-emerald-900">
                          Note: Non-filer surcharge applies where applicable
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-900">
                          {pkr(whtCalculations.reduce((sum, w) => sum + w.totalTax, 0))} total
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setWhtDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* ── Error Message ──────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="flex items-start gap-3 py-4">
                    <AlertTriangle className="mt-0.5 size-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Calculation Error</p>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* ── Results Panel ────────────────────────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <Card className="border-emerald-300 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-emerald-900">
                    <FileBarChart className="size-6 text-emerald-600" />
                    Tax Computation Results
                  </CardTitle>
                  <CardDescription>
                    Based on FBR Tax Year {TAX_YEAR} slabs for {activeHeadConfig?.label} income.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                      label="Gross Income"
                      value={pkr(result.grossIncome)}
                      color="bg-emerald-50 border-emerald-200 text-emerald-800"
                    />
                    <SummaryCard
                      label="Total Deductions"
                      value={pkr(result.totalDeductions)}
                      color="bg-blue-50 border-blue-200 text-blue-800"
                    />
                    <SummaryCard
                      label="Taxable Income"
                      value={pkr(result.taxableIncome)}
                      color="bg-amber-50 border-amber-200 text-amber-800"
                    />
                    <SummaryCard
                      label="Total Tax"
                      value={pkr(result.totalTax)}
                      color="bg-red-50 border-red-200 text-red-800"
                    />
                  </div>

                  <Separator className="bg-emerald-100" />

                  {/* Effective Rate */}
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Effective Tax Rate</p>
                      <p className="text-xs text-emerald-600">
                        Tax as percentage of gross income
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-emerald-700">
                      {result.effectiveRate.toFixed(1)}%
                    </span>
                  </div>

                  {/* Slab-wise Breakdown */}
                  {result.breakdown.slabs.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-emerald-900">
                        Slab-wise Tax Breakdown
                      </h3>
                      <div className="rounded-lg border border-emerald-200 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-emerald-50">
                            <TableRow className="border-emerald-200">
                              <TableHead className="text-emerald-800 font-semibold">Income Slab</TableHead>
                              <TableHead className="text-emerald-800 font-semibold">Rate</TableHead>
                              <TableHead className="text-right text-emerald-800 font-semibold">
                                Tax (PKR)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.breakdown.slabs.map((slab, idx) => (
                              <TableRow key={idx} className="border-emerald-100">
                                <TableCell className="text-sm">{slab.slab}</TableCell>
                                <TableCell className="text-sm">{slab.rate}</TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                  {pkr(slab.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Deductions Breakdown */}
                  {result.breakdown.deductions.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-emerald-900">
                        Deductions Applied
                      </h3>
                      <div className="rounded-lg border border-emerald-200 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-emerald-50">
                            <TableRow className="border-emerald-200">
                              <TableHead className="text-emerald-800 font-semibold">Section</TableHead>
                              <TableHead className="text-right text-emerald-800 font-semibold">
                                Amount (PKR)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.breakdown.deductions.map((ded, idx) => (
                              <TableRow key={idx} className="border-emerald-100">
                                <TableCell className="text-sm">{ded.section}</TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                  {pkr(ded.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter className="bg-emerald-50 border-emerald-200">
                            <TableRow>
                              <TableCell className="font-bold text-emerald-900">
                                Total Deductions
                              </TableCell>
                              <TableCell className="text-right font-bold text-emerald-900">
                                {pkr(result.totalDeductions)}
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Tax Details */}
                  <div className="rounded-lg border border-emerald-200 overflow-hidden">
                    <Table>
                      <TableBody>
                        <TaxDetailRow label="Tax Computed" value={pkr(result.taxComputed)} />
                        {result.superTax > 0 && (
                          <TaxDetailRow
                            label="Super Tax (4% on > PKR 10M)"
                            value={pkr(result.superTax)}
                          />
                        )}
                        {result.minimumTax > 0 && (
                          <TaxDetailRow
                            label="Minimum Tax (1.25% of turnover)"
                            value={pkr(result.minimumTax)}
                          />
                        )}
                        <TableRow className="border-t-2 border-emerald-300 bg-emerald-50">
                          <TableCell className="font-bold text-emerald-900 py-3">
                            Total Tax Payable
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-emerald-900 py-3">
                            {pkr(result.totalTax)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => setView('reports')}
                    >
                      <FileBarChart className="size-4" />
                      Save & View Reports
                    </Button>
                    <Button
                      className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                      onClick={() => setView('savings-score')}
                    >
                      <Sparkles className="size-4" />
                      View Savings Score
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      onClick={handleViewFBRReturn}
                    >
                      <FileJson className="size-4" />
                      View FBR Return
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      onClick={handleReset}
                    >
                      <RotateCcw className="size-4" />
                      New Calculation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FBR Return Dialog ─────────────────────────────────────── */}
        <Dialog open={fbrDialogOpen} onOpenChange={setFbrDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-900">
                <FileJson className="size-5 text-emerald-600" />
                FBR Return Data (ITR-1)
              </DialogTitle>
              <DialogDescription>
                Generated ITR-1 compatible JSON return data for FBR IRIS filing.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-emerald-200 bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words">
                {fbrJson || 'No data generated'}
              </pre>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  navigator.clipboard.writeText(fbrJson)
                }}
              >
                Copy JSON
              </Button>
              <Button onClick={() => setFbrDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Empty State / Loading ──────────────────────────────── */}
        {loading && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <Card className="border-emerald-200/60">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="size-8 animate-spin text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">
                    Computing your tax liability...
                  </p>
                  <div className="w-full space-y-3">
                    <Skeleton className="h-4 w-full bg-emerald-100" />
                    <Skeleton className="h-4 w-3/4 bg-emerald-100" />
                    <Skeleton className="h-8 w-1/2 bg-emerald-100" />
                    <Skeleton className="h-4 w-full bg-emerald-100" />
                    <Skeleton className="h-4 w-2/3 bg-emerald-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-sm font-bold mt-1 truncate">{value}</p>
    </div>
  )
}

function TaxDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow className="border-emerald-100">
      <TableCell className="text-sm text-muted-foreground">{label}</TableCell>
      <TableCell className="text-right font-medium text-sm">{value}</TableCell>
    </TableRow>
  )
}

'use client'

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import {
  Upload,
  FileText,
  ImageIcon,
  X,
  Loader2,
  ScanSearch,
  Calculator,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingDown,
  ArrowRight,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app'
import type { TaxInput } from '@/lib/tax-engine'

// ─── Types ─────────────────────────────────────────────────────

interface ExtractedField {
  key: string
  label: string
  value?: string
}

interface DeductionSuggestion {
  section: string
  label: string
  amount: number
  reason: string
  confidence: string
}

interface AutoCalcResult {
  documentType: string
  routedTo: string
  routingConfidence: string
  fileName: string | null
  taxInput: {
    incomeHead: string
    taxYear: string
    grossIncome: number
    entityType?: string
  }
  initialCalculation: {
    grossIncome: number
    totalDeductions: number
    taxableIncome: number
    taxComputed: number
    superTax: number
    totalTax: number
    effectiveRate: number
    slabs: { slab: string; rate: string; amount: number }[]
  }
  optimizedCalculation: {
    totalDeductions: number
    taxableIncome: number
    taxComputed: number
    superTax: number
    totalTax: number
    effectiveRate: number
    slabs: { slab: string; rate: string; amount: number }[]
    deductions: { section: string; amount: number }[]
  }
  aiDeductions: {
    deductions: DeductionSuggestion[]
    explanation: string
    totalEstimatedSavings: string
  }
  taxSaved: number
  savingsPercentage: string
}

interface DocQueueItem {
  id: string
  file: File
  preview: string | null
  status: 'pending' | 'uploading' | 'uploaded' | 'scanning' | 'scanned' | 'calculating' | 'done' | 'error'
  documentId: string
  extractedData: Record<string, string>
  calcResult: AutoCalcResult | null
  error: string
}

// ─── Extracted Data Field Definitions ─────────────────────────

const EXTRACTED_FIELDS: ExtractedField[] = [
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'employerName', label: 'Employer Name' },
  { key: 'basicSalary', label: 'Basic Salary (PKR/yr)' },
  { key: 'houseRentAllowance', label: 'House Rent Allowance (PKR/yr)' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance (PKR/yr)' },
  { key: 'medicalAllowance', label: 'Medical Allowance (PKR/yr)' },
  { key: 'utilityAllowance', label: 'Utility Allowance (PKR/yr)' },
  { key: 'specialAllowance', label: 'Special Allowance (PKR/yr)' },
  { key: 'bonus', label: 'Bonus / Commission (PKR/yr)' },
  { key: 'taxYear', label: 'Tax Year' },
  { key: 'incomeHead', label: 'Income Head' },
  { key: 'designation', label: 'Designation' },
  { key: 'payPeriod', label: 'Pay Period' },
  { key: 'providentFundEmployee', label: 'Provident Fund - Employee (PKR/yr)' },
  { key: 'eobiEmployee', label: 'EOBI Contribution (PKR/yr)' },
  { key: 'grossSalary', label: 'Gross Salary (PKR/yr)' },
  { key: 'businessIncome', label: 'Business Income (PKR/yr)' },
  { key: 'propertyIncome', label: 'Property Income (PKR/yr)' },
  { key: 'capitalGains', label: 'Capital Gains (PKR/yr)' },
  { key: 'otherIncome', label: 'Other Income (PKR/yr)' },
  { key: 'zakat', label: 'Zakat Deducted (PKR/yr)' },
]

// ─── Helpers ───────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatPKR(n: number): string {
  if (n === 0) return '0'
  return Math.abs(n).toLocaleString('en-PK')
}

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

// ─── Component ─────────────────────────────────────────────────

export default function DocumentScanner() {
  const setView = useAppStore((s) => s.setView)

  const [queue, setQueue] = useState<DocQueueItem[]>([])
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeductions, setShowDeductions] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  // ─── File Handling ─────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    const newItems: DocQueueItem[] = []

    for (const f of Array.from(files)) {
      if (!validTypes.includes(f.type)) continue
      if (f.size > 10 * 1024 * 1024) continue

      let preview: string | null = null
      if (isImageType(f.type)) {
        // Create object URL for preview
        preview = URL.createObjectURL(f)
      }

      newItems.push({
        id: crypto.randomUUID(),
        file: f,
        preview,
        status: 'pending',
        documentId: '',
        extractedData: {},
        calcResult: null,
        error: '',
      })
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems])
      // Auto-activate the first pending doc
      if (!activeDoc || queue.length === 0) {
        setActiveDoc(newItems[0].id)
      }
    }
  }, [activeDoc, queue.length])

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      addFiles([selectedFile])
    },
    [addFiles]
  )

  // ─── Drag & Drop ────────────────────────────────────────

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current += 1
    if (dragCounter.current === 1) setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation()
      dragCounter.current = 0
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [addFiles]
  )

  // ─── Upload + Scan + Auto-Calculate Pipeline ───────────

  async function processDoc(docId: string) {
    const doc = queue.find((d) => d.id === docId)
    if (!doc) return

    // Step 1: Upload
    updateDoc(docId, { status: 'uploading', error: '' })
    try {
      const formData = new FormData()
      formData.append('file', doc.file)
      const res = await fetch('/api/documents', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        updateDoc(docId, { status: 'error', error: json.error || 'Upload failed' })
        return
      }
      updateDoc(docId, { status: 'uploaded', documentId: json.id })
    } catch {
      updateDoc(docId, { status: 'error', error: 'Network error during upload' })
      return
    }

    // Step 2: AI Scan
    updateDoc(docId, { status: 'scanning' })
    let extractedData: Record<string, unknown> = {}
    try {
      const res = await fetch('/api/documents/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.documentId || queue.find(d => d.id === docId)?.documentId }),
      })
      const json = await res.json()
      if (!res.ok) {
        updateDoc(docId, { status: 'error', error: json.error || 'Scanning failed' })
        return
      }
      extractedData = json.extractedData || {}

      const stringified: Record<string, string> = {}
      for (const [k, v] of Object.entries(extractedData)) {
        stringified[k] = v != null ? String(v) : ''
      }
      updateDoc(docId, { status: 'scanned', extractedData: stringified })
    } catch {
      updateDoc(docId, { status: 'error', error: 'Network error during scan' })
      return
    }

    // Step 3: Auto-Calculate
    updateDoc(docId, { status: 'calculating' })
    try {
      const res = await fetch('/api/ai/auto-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData,
          documentType: extractedData.documentType || null,
          fileName: doc.file.name,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        updateDoc(docId, { status: 'scanned', error: json.error || 'Auto-calculation failed' })
        return
      }
      updateDoc(docId, { status: 'done', calcResult: json.data as AutoCalcResult })
    } catch {
      updateDoc(docId, { status: 'scanned', error: 'Network error during auto-calculation' })
    }
  }

  function processAllPending() {
    for (const doc of queue) {
      if (doc.status === 'pending') processDoc(doc.id)
    }
  }

  // ─── Helpers ────────────────────────────────────────────

  function updateDoc(id: string, updates: Partial<DocQueueItem>) {
    setQueue((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  }

  function removeDoc(id: string) {
    setQueue((prev) => {
      const filtered = prev.filter((d) => d.id !== id)
      if (activeDoc === id) {
        setActiveDoc(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  function updateField(docId: string, key: string, value: string) {
    updateDoc(docId, {
      extractedData: { ...queue.find(d => d.id === docId)?.extractedData, [key]: value },
    })
  }

  function resetAll() {
    setQueue([])
    setActiveDoc(null)
    setShowDeductions(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleUseInCalculator(docId: string) {
    const doc = queue.find((d) => d.id === docId)
    if (!doc) return
    const data = doc.extractedData
    const grossIncome =
      parseFloat(data.grossSalary || '0') ||
      parseFloat(data.basicSalary || '0') +
      parseFloat(data.houseRentAllowance || '0') +
      parseFloat(data.conveyanceAllowance || '0') +
      parseFloat(data.medicalAllowance || '0') +
      parseFloat(data.utilityAllowance || '0') +
      parseFloat(data.specialAllowance || '0') +
      parseFloat(data.bonus || '0')

    const taxInput: Partial<TaxInput> = {
      incomeHead: (data.incomeHead as TaxInput['incomeHead']) || 'salary',
      taxYear: data.taxYear || new Date().getFullYear().toString(),
      grossIncome: isNaN(grossIncome) ? 0 : grossIncome,
    }
    sessionStorage.setItem('taxmind_scanner_input', JSON.stringify(taxInput))
    sessionStorage.setItem('taxmind_scanner_extracted', JSON.stringify(data))
    setView('calculator')
  }

  // ─── Derived State ──────────────────────────────────────

  const currentDoc = queue.find((d) => d.id === activeDoc) || null
  const completedDocs = queue.filter((d) => d.status === 'done')
  const isProcessing = queue.some((d) => ['uploading', 'scanning', 'calculating'].includes(d.status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <ScanSearch className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Document Scanner</h1>
              <p className="text-sm text-muted-foreground">
                Upload documents → AI extracts data → auto-calculates tax with deduction optimization
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* ─── Left Panel: Upload + Doc Queue ─────────── */}
          <div className="space-y-4">
            {/* Drop Zone */}
            <Card>
              <CardContent className="pt-5">
                <div
                  role="button"
                  tabIndex={0}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
                  className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleInputChange}
                  />
                  <Upload className={`h-7 w-7 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mt-2 text-sm font-medium">
                    {isDragging ? 'Drop here' : 'Drop or click to upload'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Images & PDFs up to 10 MB · Multiple files OK</p>
                </div>

                {queue.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={processAllPending} disabled={isProcessing} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <Zap className="mr-1.5 h-3.5 w-3.5" />
                      {isProcessing ? 'Processing...' : 'Process All'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={resetAll}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Queue */}
            {queue.length > 0 && (
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm">Documents ({queue.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {queue.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.id)}
                        className={`w-full flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors ${
                          activeDoc === doc.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        {doc.status === 'uploading' || doc.status === 'scanning' || doc.status === 'calculating' ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                        ) : doc.status === 'done' ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : doc.status === 'error' ? (
                          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{doc.file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatFileSize(doc.file.size)} · {doc.status === 'done' ? 'Calculated' : doc.status === 'error' ? 'Error' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </p>
                        </div>
                        {doc.status !== 'uploading' && doc.status !== 'scanning' && doc.status !== 'calculating' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeDoc(doc.id) }}
                            className="shrink-0 p-0.5 rounded hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ─── Right Panel: Active Doc Details / Results ── */}
          <div className="space-y-4">
            {!currentDoc ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <ScanSearch className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Upload a document to get started
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Salary slips, tax certificates, bank statements, property documents
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {/* Processing states */}
                {(currentDoc.status === 'uploading' || currentDoc.status === 'scanning' || currentDoc.status === 'calculating') && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-4 text-sm font-medium">
                          {currentDoc.status === 'uploading' && 'Uploading document...'}
                          {currentDoc.status === 'scanning' && 'AI is reading your document...'}
                          {currentDoc.status === 'calculating' && 'Calculating tax + finding deductions...'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">This takes 10-30 seconds</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Error state */}
                {currentDoc.status === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="border-destructive/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-destructive">Processing Error</p>
                            <p className="mt-1 text-xs text-muted-foreground">{currentDoc.error}</p>
                            <Button size="sm" variant="outline" className="mt-3" onClick={() => processDoc(currentDoc.id)}>
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                              Retry
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Scanned — editable extraction + auto-calculate button */}
                {currentDoc.status === 'scanned' && (
                  <motion.div key="scanned" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Data Extracted — Review & Auto-Calculate
                            </CardTitle>
                            <CardDescription className="mt-1">Edit any fields, then hit Auto-Calculate</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {currentDoc.error && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {currentDoc.error}
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {EXTRACTED_FIELDS.map((field) => {
                            const value = currentDoc.extractedData[field.key] || ''
                            if (value === '' && field.key !== 'employeeName' && field.key !== 'employerName' && field.key !== 'taxYear') return null
                            return (
                              <div key={field.key} className="grid gap-1">
                                <Label htmlFor={`f-${currentDoc.id}-${field.key}`} className="text-[11px] text-muted-foreground">
                                  {field.label}
                                </Label>
                                <Input
                                  id={`f-${currentDoc.id}-${field.key}`}
                                  value={value}
                                  onChange={(e) => updateField(currentDoc.id, field.key, e.target.value)}
                                  className="text-sm h-8"
                                />
                              </div>
                            )
                          })}
                        </div>
                        <Separator className="my-4" />
                        <div className="flex gap-2">
                          <Button onClick={() => processDoc(currentDoc.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <Zap className="mr-2 h-4 w-4" />
                            Auto-Calculate Tax
                          </Button>
                          <Button variant="outline" onClick={() => handleUseInCalculator(currentDoc.id)}>
                            <Calculator className="mr-2 h-4 w-4" />
                            Manual
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Done — Full calculation result */}
                {currentDoc.status === 'done' && currentDoc.calcResult && (
                  <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Document Routing Info */}
                    <Card>
                      <CardContent className="pt-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="text-sm font-semibold">{currentDoc.calcResult.documentType}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Routed to: {currentDoc.calcResult.routedTo} ({currentDoc.calcResult.routingConfidence} confidence)
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI Optimized
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tax Result Summary */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Before AI Optimization */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Before AI Optimization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Gross Income</span>
                            <span className="font-mono">PKR {formatPKR(currentDoc.calcResult.initialCalculation.grossIncome)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Taxable Income</span>
                            <span className="font-mono">PKR {formatPKR(currentDoc.calcResult.initialCalculation.taxableIncome)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold border-t pt-2">
                            <span>Total Tax</span>
                            <span className="font-mono text-destructive">PKR {formatPKR(currentDoc.calcResult.initialCalculation.totalTax)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Effective Rate</span>
                            <span className="font-mono">{currentDoc.calcResult.initialCalculation.effectiveRate}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* After AI Optimization */}
                      <Card className="border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-emerald-700 dark:text-emerald-300">After AI Optimization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total Deductions</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">- PKR {formatPKR(currentDoc.calcResult.optimizedCalculation.totalDeductions)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Taxable Income</span>
                            <span className="font-mono">PKR {formatPKR(currentDoc.calcResult.optimizedCalculation.taxableIncome)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold border-t pt-2">
                            <span>Total Tax</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">PKR {formatPKR(currentDoc.calcResult.optimizedCalculation.totalTax)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Effective Rate</span>
                            <span className="font-mono">{currentDoc.calcResult.optimizedCalculation.effectiveRate}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Savings Banner */}
                    {currentDoc.calcResult.taxSaved > 0 && (
                      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30">
                          <CardContent className="pt-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
                                <TrendingDown className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">AI Saved You</p>
                                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                                  PKR {formatPKR(currentDoc.calcResult.taxSaved)}
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                  {currentDoc.calcResult.savingsPercentage}% reduction via {currentDoc.calcResult.aiDeductions.deductions.length} deduction sections
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Slab Breakdown */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Slab-wise Tax Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {currentDoc.calcResult.optimizedCalculation.slabs.map((slab, i) => (
                            <div key={i} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-xs">
                              <span className="text-muted-foreground flex-1">{slab.slab}</span>
                              <span className="font-mono mx-2">{slab.rate}</span>
                              <span className="font-mono font-medium w-28 text-right">PKR {formatPKR(slab.amount)}</span>
                            </div>
                          ))}
                          {currentDoc.calcResult.optimizedCalculation.superTax > 0 && (
                            <div className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-xs">
                              <span className="text-muted-foreground flex-1">Super Tax</span>
                              <span className="font-mono font-medium w-28 text-right">PKR {formatPKR(currentDoc.calcResult.optimizedCalculation.superTax)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Deduction Suggestions */}
                    {currentDoc.calcResult.aiDeductions.deductions.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowDeductions(!showDeductions)}>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              AI Suggested Deductions ({currentDoc.calcResult.aiDeductions.deductions.length})
                            </CardTitle>
                            {showDeductions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </CardHeader>
                        <AnimatePresence>
                          {showDeductions && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              <CardContent>
                                <div className="space-y-3 mb-4">
                                  {currentDoc.calcResult.aiDeductions.deductions.map((d, i) => (
                                    <div key={i} className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-[10px] font-mono">{d.section}</Badge>
                                          <span className="text-sm font-medium">{d.label}</span>
                                        </div>
                                        <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                          PKR {formatPKR(d.amount)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{d.reason}</p>
                                      <Badge
                                        variant="secondary"
                                        className={`mt-1 text-[9px] ${
                                          d.confidence === 'high'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                        }`}
                                      >
                                        {d.confidence} confidence
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                                {currentDoc.calcResult.aiDeductions.explanation && (
                                  <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                      {currentDoc.calcResult.aiDeductions.explanation}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )}

                    {/* Applied Deductions */}
                    {currentDoc.calcResult.optimizedCalculation.deductions.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Applied Deductions in Calculation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {currentDoc.calcResult.optimizedCalculation.deductions.map((d, i) => (
                              <div key={i} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-xs">
                                <span className="text-muted-foreground">{d.section}</span>
                                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                  - PKR {formatPKR(d.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleUseInCalculator(currentDoc.id)} className="flex-1">
                        <Calculator className="mr-2 h-4 w-4" />
                        Open in Full Calculator
                      </Button>
                      <Button variant="outline" onClick={() => processDoc(currentDoc.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Recalculate
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

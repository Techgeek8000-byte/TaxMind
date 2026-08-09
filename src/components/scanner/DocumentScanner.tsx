'use client'

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app'
import type { TaxInput } from '@/lib/tax-engine'

// ─── Types ─────────────────────────────────────────────────────
interface UploadedDocument {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  status: string
}

interface ExtractedField {
  key: string
  label: string
  value: string
}

interface ScanResult {
  id: string
  extractedData: Record<string, unknown>
  status: string
}

// ─── Extracted Data Field Definitions ─────────────────────────
const EXTRACTED_FIELDS: ExtractedField[] = [
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'employerName', label: 'Employer Name' },
  { key: 'basicSalary', label: 'Basic Salary (PKR)' },
  { key: 'houseRentAllowance', label: 'House Rent Allowance (PKR)' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance (PKR)' },
  { key: 'medicalAllowance', label: 'Medical Allowance (PKR)' },
  { key: 'utilityAllowance', label: 'Utility Allowance (PKR)' },
  { key: 'specialAllowance', label: 'Special Allowance (PKR)' },
  { key: 'bonus', label: 'Bonus / Commission (PKR)' },
  { key: 'taxYear', label: 'Tax Year' },
  { key: 'incomeHead', label: 'Income Head' },
  { key: 'employerCnic', label: 'Employer CNIC' },
  { key: 'employeeCnic', label: 'Employee CNIC' },
  { key: 'department', label: 'Department / Division' },
  { key: 'designation', label: 'Designation' },
  { key: 'payPeriod', label: 'Pay Period' },
  { key: 'providentFund', label: 'Provident Fund Deduction (PKR)' },
  { key: 'eobi', label: 'EOBI Contribution (PKR)' },
]

// ─── Helpers ───────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageIconType(type: string): boolean {
  return type.startsWith('image/')
}

// ─── Component ─────────────────────────────────────────────────
export default function DocumentScanner() {
  const setView = useAppStore((s) => s.setView)

  // State machine: idle → uploading → uploaded → scanning → scanned
  const [step, setStep] = useState<'idle' | 'uploading' | 'uploaded' | 'scanning' | 'scanned'>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState('')
  const [error, setError] = useState('')
  const [extractedData, setExtractedData] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  // ─── File Handling ─────────────────────────────────────
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, WebP, GIF) or PDF.')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }

    setError('')
    setFile(selectedFile)
    setStep('idle')

    // Generate preview
    if (isImageIconType(selectedFile.type)) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }, [])

  // ─── Drag & Drop ────────────────────────────────────────
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (dragCounter.current === 1) setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) handleFileSelect(selected)
    },
    [handleFileSelect]
  )

  // ─── Upload ────────────────────────────────────────────
  async function handleUpload() {
    if (!file) return
    setStep('uploading')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Upload failed. Please try again.')
        setStep('idle')
        return
      }

      const doc = json as UploadedDocument
      setDocumentId(doc.id)
      setStep('uploaded')
    } catch {
      setError('Network error. Please check your connection.')
      setStep('idle')
    }
  }

  // ─── AI Scan ───────────────────────────────────────────
  async function handleScan() {
    if (!documentId) return
    setStep('scanning')
    setError('')

    try {
      const res = await fetch('/api/documents/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Scanning failed. Please try again.')
        setStep('uploaded')
        return
      }

      const result = json as ScanResult
      const data = result.extractedData as Record<string, unknown>

      // Convert all values to strings for editable fields
      const stringified: Record<string, string> = {}
      for (const [key, val] of Object.entries(data)) {
        stringified[key] = val != null ? String(val) : ''
      }
      setExtractedData(stringified)
      setStep('scanned')
    } catch {
      setError('Network error. Please check your connection.')
      setStep('uploaded')
    }
  }

  // ─── Use in Calculator ──────────────────────────────────
  function handleUseInCalculator() {
    const grossIncome = parseFloat(extractedData.basicSalary || '0')
      + parseFloat(extractedData.houseRentAllowance || '0')
      + parseFloat(extractedData.conveyanceAllowance || '0')
      + parseFloat(extractedData.medicalAllowance || '0')
      + parseFloat(extractedData.utilityAllowance || '0')
      + parseFloat(extractedData.specialAllowance || '0')
      + parseFloat(extractedData.bonus || '0')

    const taxInput: Partial<TaxInput> = {
      incomeHead: (extractedData.incomeHead as TaxInput['incomeHead']) || 'salary',
      taxYear: extractedData.taxYear || new Date().getFullYear().toString(),
      grossIncome: isNaN(grossIncome) ? 0 : grossIncome,
    }

    // Store in sessionStorage for the calculator to pick up
    sessionStorage.setItem('taxmind_scanner_input', JSON.stringify(taxInput))
    sessionStorage.setItem('taxmind_scanner_extracted', JSON.stringify(extractedData))
    setView('calculator')
  }

  // ─── Reset ─────────────────────────────────────────────
  function handleReset() {
    setStep('idle')
    setFile(null)
    setPreview(null)
    setDocumentId('')
    setError('')
    setExtractedData({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Update extracted field ─────────────────────────────
  function updateField(key: string, value: string) {
    setExtractedData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Document Scanner
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload salary slips, tax forms, or income documents and let AI extract the data for you.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* ─── Upload Zone ──────────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 'idle' && !file && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div
                      role="button"
                      tabIndex={0}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                      }}
                      className={`relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                        isDragging
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                        className="hidden"
                        onChange={handleInputChange}
                      />
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="mt-4 text-sm font-medium">
                        {isDragging ? 'Drop your file here' : 'Drag & drop your document here'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        or click to browse — images and PDFs up to 10 MB
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="text-xs">JPEG</Badge>
                        <Badge variant="secondary" className="text-xs">PNG</Badge>
                        <Badge variant="secondary" className="text-xs">WebP</Badge>
                        <Badge variant="secondary" className="text-xs">PDF</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── File Preview ────────────────────────────── */}
            {(file && step === 'idle') && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">File Selected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                      {/* Thumbnail */}
                      <div className="flex h-32 w-full max-w-[200px] shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="h-10 w-10" />
                            <span className="text-xs">PDF Document</span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium break-all">{file.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {isImageIconType(file.type) ? (
                                <ImageIcon className="h-3 w-3" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                              {file.type.split('/')[1].toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                          >
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {error}
                          </motion.div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={handleUpload} disabled={!!error}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </Button>
                          <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Change File
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── Uploading State ─────────────────────────── */}
            {step === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-sm font-medium">Uploading document…</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please wait while we process your file.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── Uploaded — Ready to Scan ────────────────── */}
            {step === 'uploaded' && (
              <motion.div
                key="uploaded"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Document Uploaded
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {file?.name} — Ready for AI scanning
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                    <Button onClick={handleScan} className="w-full sm:w-auto" disabled={!!error}>
                      <ScanSearch className="mr-2 h-4 w-4" />
                      Scan with AI
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── Scanning State ──────────────────────────── */}
            {step === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <ScanSearch className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary/30" />
                    </div>
                    <p className="mt-4 text-sm font-medium">Scanning document with AI…</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Extracting text and data fields from your document.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ─── Extracted Data ──────────────────────────── */}
            {step === 'scanned' && (
              <motion.div
                key="scanned"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Extracted Data
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Review and edit the extracted information before using it.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Scan Another
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {EXTRACTED_FIELDS.map((field) => {
                        const value = extractedData[field.key] || ''
                        return (
                          <div key={field.key} className="grid gap-1.5">
                            <Label htmlFor={`field-${field.key}`} className="text-xs text-muted-foreground">
                              {field.label}
                            </Label>
                            <Input
                              id={`field-${field.key}`}
                              value={value}
                              onChange={(e) => updateField(field.key, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="text-sm"
                            />
                          </div>
                        )
                      })}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button onClick={handleUseInCalculator} className="sm:flex-1">
                        <Calculator className="mr-2 h-4 w-4" />
                        Use in Calculator
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Scan Another Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Error State (standalone) ──────────────────── */}
          {!file && error && step === 'idle' && (
            <Card className="border-destructive/50">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Upload Error</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

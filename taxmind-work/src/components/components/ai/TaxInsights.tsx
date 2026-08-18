'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import {
  Sparkles,
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  Shield,
  TrendingDown,
  RefreshCw,
  BookOpen,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────

interface Insight {
  category: string
  title: string
  description: string
  savingsEstimate: string
  sections: string[]
  priority: string
  actionable: string
}

interface InsightsData {
  score: number
  summary: string
  insights: Insight[]
  missedDeductions: string[]
  riskFactors: string[]
}

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Deductions: { icon: <TrendingDown className="h-4 w-4" />, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  Exemptions: { icon: <Shield className="h-4 w-4" />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40' },
  Structuring: { icon: <Target className="h-4 w-4" />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40' },
  Compliance: { icon: <BookOpen className="h-4 w-4" />, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/40' },
  Planning: { icon: <Lightbulb className="h-4 w-4" />, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100 dark:bg-teal-900/40' },
}

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
}

// ─── Main Component ─────────────────────────────────────────────

export default function TaxInsights() {
  const { setView } = useAppStore()
  const [data, setData] = useState<InsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const generateInsights = useCallback(async (overrides?: Record<string, string | boolean>) => {
    setIsLoading(true)
    setError('')

    try {
      const body: Record<string, unknown> = {}
      if (overrides) Object.assign(body, overrides)

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        setError('Failed to generate insights. Please try again.')
        return
      }

      setData(json.data as InsightsData)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const scoreColor = data
    ? data.score >= 70
      ? 'text-emerald-600 dark:text-emerald-400'
      : data.score >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setView('dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Tax Insights</h1>
            <p className="text-sm text-muted-foreground">Personalized AI analysis of your tax optimization potential</p>
          </div>
        </div>

        {/* Generate Button / Loading */}
        {!data && !isLoading && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Discover Your Tax Savings</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Our AI will analyze your tax profile and history to find personalized saving opportunities, missed deductions, and compliance risks.
            </p>
            <Button onClick={() => generateInsights()} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Insights
            </Button>
          </motion.div>
        )}

        {isLoading && (
          <div className="space-y-6 py-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => generateInsights()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Score + Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1 border-primary/30">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Tax Optimization Score</p>
                    <p className={`text-5xl font-bold ${scoreColor}`}>{data.score}</p>
                    <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                    <Progress value={data.score} className="mt-4 h-2" />
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">AI Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {data.summary}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Insights Grid */}
              {data.insights.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Personalized Insights</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.insights.map((insight, idx) => {
                      const style = CATEGORY_STYLES[insight.category] || CATEGORY_STYLES['Planning']
                      const priorityColor = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS['Low']
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                        >
                          <Card className="h-full hover:shadow-md transition-shadow">
                            <CardContent className="pt-5">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.color}`}>
                                    {style.icon}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm leading-tight">{insight.title}</p>
                                    <Badge variant="secondary" className={`text-[10px] mt-1 ${priorityColor}`}>
                                      {insight.priority} Priority
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                {insight.description}
                              </p>
                              {insight.savingsEstimate && (
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 mb-3">
                                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                                    Est. Savings: {insight.savingsEstimate}
                                  </p>
                                </div>
                              )}
                              {insight.sections.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {insight.sections.map((s) => (
                                    <Badge key={s} variant="outline" className="text-[10px] font-mono">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="rounded-lg bg-muted/50 px-3 py-2">
                                <p className="text-xs font-medium">Next Step:</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{insight.actionable}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Missed Deductions */}
              {data.missedDeductions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingDown className="h-4 w-4 text-amber-500" />
                      Deduction Sections You May Be Missing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.missedDeductions.map((d) => (
                        <Badge key={d} variant="secondary" className="text-sm py-1 px-3">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Risk Factors */}
              {data.riskFactors.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Compliance Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.riskFactors.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-amber-500 mt-1 shrink-0">●</span>
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{r}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Regenerate */}
              <div className="text-center py-4">
                <Button onClick={() => generateInsights()} variant="outline" disabled={isLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate Insights
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

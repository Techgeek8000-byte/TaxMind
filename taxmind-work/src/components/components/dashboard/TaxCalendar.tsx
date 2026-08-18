'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FileText,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay,
  isToday,
} from 'date-fns'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Types ─────────────────────────────────────────────────────
interface TaxEvent {
  date: Date
  title: string
  type: 'filing' | 'payment' | 'statement'
  description: string
}

// ─── Tax Year 2024-2025 Key Dates ──────────────────────────────
// All dates for TY 2024-2025 (Jul 2024 – Jun 2025)
const TY_KEY_DATES: TaxEvent[] = [
  // Jul 2024
  { date: new Date(2024, 6, 1), title: 'Tax Year Begins', type: 'statement', description: 'TY 2024-2025 starts. New tax slabs apply.' },
  { date: new Date(2024, 6, 15), title: 'Q1 Advance Tax', type: 'payment', description: 'First quarterly advance tax payment due (Sec 147).' },
  { date: new Date(2024, 6, 30), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Aug 2024
  { date: new Date(2024, 7, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Sep 2024
  { date: new Date(2024, 8, 30), title: 'Q1 Return Filing', type: 'filing', description: 'Quarterly return filing deadline for Q1 (Jul-Sep).' },
  { date: new Date(2024, 8, 30), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Oct 2024
  { date: new Date(2024, 9, 1), title: 'Quarterly Statement', type: 'statement', description: 'Quarterly statement of assets and liabilities.' },
  { date: new Date(2024, 9, 31), title: 'Annual Return', type: 'filing', description: 'Annual return deadline (extended from Sep 30 to Oct 31 by FBR).' },
  { date: new Date(2024, 9, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Nov 2024
  { date: new Date(2024, 10, 30), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Dec 2024
  { date: new Date(2024, 11, 15), title: 'Q2 Advance Tax', type: 'payment', description: 'Second quarterly advance tax payment due (Sec 147).' },
  { date: new Date(2024, 11, 31), title: 'Wealth Statement', type: 'statement', description: 'Annual wealth statement deadline under Section 116.' },
  { date: new Date(2024, 11, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Jan 2025
  { date: new Date(2025, 0, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Feb 2025
  { date: new Date(2025, 1, 28), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Mar 2025
  { date: new Date(2025, 2, 15), title: 'Q3 Advance Tax', type: 'payment', description: 'Third quarterly advance tax payment due (Sec 147).' },
  { date: new Date(2025, 2, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Apr 2025
  { date: new Date(2025, 3, 30), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // May 2025
  { date: new Date(2025, 4, 31), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },

  // Jun 2025
  { date: new Date(2025, 5, 15), title: 'Q4 Advance Tax', type: 'payment', description: 'Fourth quarterly advance tax payment due (Sec 147).' },
  { date: new Date(2025, 5, 30), title: 'Year-End', type: 'statement', description: 'Tax year 2024-2025 ends. All filings and payments close.' },
  { date: new Date(2025, 5, 30), title: 'Monthly WHT Return', type: 'filing', description: 'Monthly withholding tax return filing deadline.' },
]

// ─── Helpers ───────────────────────────────────────────────────
function getEventsForDate(date: Date): TaxEvent[] {
  return TY_KEY_DATES.filter((e) => isSameDay(e.date, date))
}

function getEventStatus(event: TaxEvent): 'overdue' | 'today' | 'upcoming' {
  const today = startOfDay(new Date())
  const eventDay = startOfDay(event.date)
  if (isBefore(eventDay, today)) return 'overdue'
  if (isSameDay(eventDay, today)) return 'today'
  return 'upcoming'
}

function getDotColor(type: TaxEvent['type']): string {
  switch (type) {
    case 'filing':
      return 'bg-emerald-500'
    case 'payment':
      return 'bg-amber-500'
    case 'statement':
      return 'bg-teal-500'
  }
}

function getStatusBadge(status: 'overdue' | 'today' | 'upcoming') {
  switch (status) {
    case 'overdue':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      )
    case 'today':
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Clock className="mr-1 h-3 w-3" />
          Due Today
        </Badge>
      )
    case 'upcoming':
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      )
  }
}

function getTypeIcon(type: TaxEvent['type']) {
  switch (type) {
    case 'filing':
      return <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    case 'payment':
      return <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    case 'statement':
      return <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-400" />
  }
}

// ─── Component ─────────────────────────────────────────────────
export default function TaxCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2024, 6, 1)) // Start at Jul 2024
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const goForward = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1))
    setSelectedDate(null)
  }, [])

  const goBack = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1))
    setSelectedDate(null)
  }, [])

  // ─── Calendar grid generation ──────────────────────────────
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  // ─── Events for selected date ─────────────────────────────
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return getEventsForDate(selectedDate)
  }, [selectedDate])

  // ─── Count events for the month ───────────────────────────
  const monthEventCount = useMemo(() => {
    return TY_KEY_DATES.filter((e) => isSameMonth(e.date, currentMonth)).length
  }, [currentMonth])

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
              <CalendarDays className="h-5 w-5 text-teal-700 dark:text-teal-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tax Calendar</h1>
              <p className="text-sm text-muted-foreground">
                FBR Key Dates — Tax Year 2024-2025
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* ─── Calendar Grid ──────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(currentMonth, 'MMMM yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {monthEventCount} tax {monthEventCount === 1 ? 'event' : 'events'} this month
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={goBack} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentMonth(new Date())
                        setSelectedDate(null)
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={goForward} className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Filing Deadline
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Payment Due
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    Statement / Other
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((d) => (
                    <div
                      key={d}
                      className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    const inMonth = isSameMonth(day, currentMonth)
                    const today = isToday(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const events = getEventsForDate(day)
                    const hasEvents = events.length > 0
                    const hasOverdue = events.some((e) => getEventStatus(e) === 'overdue')

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={
                          `relative flex h-10 sm:h-12 flex-col items-center justify-center rounded-lg text-sm transition-all
                          ${!inMonth ? 'text-muted-foreground/30 pointer-events-none' : 'hover:bg-muted/80 cursor-pointer'}
                          ${today ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-background' : ''}
                          ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}
                          ${hasOverdue && !today ? 'bg-red-50 dark:bg-red-900/10' : ''}
                        `
                      }
                      aria-label={format(day, 'd MMMM yyyy')}
                      aria-selected={isSelected || undefined}
                      role="gridcell"
                      tabIndex={inMonth ? 0 : -1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedDate(day)
                        }
                      }}
                      >
                        <span className={
                          `font-medium leading-none ${today ? 'text-emerald-700 dark:text-emerald-300 font-bold' : ''} ${!inMonth ? 'text-muted-foreground/30' : ''}`
                        }>
                          {format(day, 'd')}
                        </span>
                        {/* Colored dots for events */}
                        {hasEvents && inMonth && (
                          <div className="mt-1 flex gap-0.5">
                            {events.map((e, eIdx) => (
                              <span
                                key={eIdx}
                                className={`h-1.5 w-1.5 rounded-full ${getDotColor(e.type)}`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Selected Date Detail ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Date</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? format(selectedDate, 'EEEE, d MMMM yyyy')
                    : 'Click a date to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {selectedDate && selectedEvents.length > 0 ? (
                    <motion.div
                      key={format(selectedDate, 'yyyy-MM-dd')}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-3"
                    >
                      {selectedEvents.map((event, idx) => {
                        const status = getEventStatus(event)
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">{getTypeIcon(event.type)}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold leading-tight">
                                    {event.title}
                                  </p>
                                  {getStatusBadge(status)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {event.description}
                                </p>
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-[10px]">
                                    {event.type === 'filing' ? 'Filing' : event.type === 'payment' ? 'Payment' : 'Statement'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  ) : selectedDate ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-8 text-center"
                    >
                      <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No tax events on this date</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-8 text-center"
                    >
                      <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">Select a date to view details</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* ─── Quick Reference Card ──────────────────── */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Key Dates TY 2024-2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {TY_KEY_DATES.filter(
                    (e) =>
                      e.type !== 'filing' ||
                      !e.title.includes('Monthly'),
                  )
                    .slice(0, 10)
                    .map((event, idx) => {
                      const status = getEventStatus(event)
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDate(event.date)
                            setCurrentMonth(event.date)
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-colors hover:bg-muted/50 ${status === 'overdue' ? 'border-red-200 dark:border-red-900/40' : ''}`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : status === 'today' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}
                          >
                            {format(event.date, 'd')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-tight">{event.title}</p>
                            <p className="text-muted-foreground">{format(event.date, 'MMM yyyy')}</p>
                          </div>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${getDotColor(event.type)}`} />
                        </button>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { Leaf, Send, RotateCcw, ArrowLeft, MessageSquare, Sparkles, Download, Trash2, FileText } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  isError?: boolean
}

// ─── Constants ──────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  'How to reduce my salary tax?',
  'Explain Sec 111(4) investment scheme',
  'Presumptive tax vs normal - which is better?',
  'How to file FBR wealth statement?',
  'Capital gains tax rates 2024-25',
  'Best deductions for salaried individuals',
]

const SYSTEM_CONTEXT = 'tax-advisor'

// ─── Animation Variants ─────────────────────────────────────────

const messageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
}

const dotBounce = {
  animate: (i: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut' as const,
    },
  }),
}

// ─── Typing Indicator ───────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-3 max-w-[85%] sm:max-w-[70%]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Avatar className="h-8 w-8 shrink-0 border border-emerald-200 dark:border-emerald-800">
        <AvatarFallback className="bg-emerald-600 text-white text-xs">
          <Leaf className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-2 w-2 rounded-full bg-emerald-500"
              custom={i}
              variants={dotBounce}
              animate="animate"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Markdown Code Block ────────────────────────────────────────

function CodeBlock({ children, className }: { children: string; className?: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-sm text-emerald-400">
      <code className={className}>{children}</code>
    </pre>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export default function TaxChat() {
  const { user, setView } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summary, setSummary] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Auto-scroll to bottom on new messages or loading state ──
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages, isLoading])

  // ── Focus input on mount ──
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ── Build history for multi-turn context ──
  const getChatHistory = useCallback(() => {
    return messages
      .filter((m) => !m.isError)
      .slice(-10) // last 10 messages for context
      .map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
  }, [messages])

  // ── Send message handler ──
  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim()
      if (!messageText || isLoading) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      try {
        const history = getChatHistory()

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, context: SYSTEM_CONTEXT }),
        })

        const data = await res.json()

        if (!res.ok || !data.success) {
          const aiMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'ai',
            content: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date(),
            isError: true,
          }
          setMessages((prev) => [...prev, aiMsg])
          return
        }

        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: data.data.reply,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])
      } catch {
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'ai',
          content:
            'Network error — I could not reach the server. Please check your connection and try again.',
          timestamp: new Date(),
          isError: true,
        }
        setMessages((prev) => [...prev, aiMsg])
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    },
    [input, isLoading, getChatHistory],
  )

  // ── Generate AI Summary ──
  const handleSummarize = useCallback(async () => {
    if (messages.length < 2 || isSummarizing) return
    setIsSummarizing(true)
    try {
      const history = getChatHistory()
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please provide a concise summary of our entire conversation above. Focus on key tax advice, ITO sections mentioned, and actionable takeaways.`,
          context: SYSTEM_CONTEXT,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSummary(data.data.reply)
      }
    } catch {
      // Silently fail
    } finally {
      setIsSummarizing(false)
    }
  }, [messages, isSummarizing, getChatHistory])

  // ── Export chat as text ──
  const handleExport = useCallback(() => {
    if (messages.length === 0) return
    const lines = [
      'TaxMind AI — Conversation Export',
      `Date: ${new Date().toLocaleString()}`,
      'User: ' + (user?.email || 'Unknown'),
      '─'.repeat(50),
      '',
    ]
    for (const msg of messages) {
      const time = msg.timestamp.toLocaleTimeString()
      const role = msg.role === 'user' ? 'You' : 'TaxMind AI'
      lines.push(`[${time}] ${role}:`)
      lines.push(msg.content)
      lines.push('')
    }
    if (summary) {
      lines.push('─'.repeat(50))
      lines.push('AI Summary:')
      lines.push(summary)
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taxmind-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages, summary, user])

  // ── Clear chat ──
  const clearChat = useCallback(() => {
    setMessages([])
    setSummary('')
  }, [])

  // ── Retry last failed message ──
  const retryLastFailed = useCallback(() => {
    const lastFailedIndex = [...messages].reverse().findIndex((m) => m.isError && m.role === 'ai')
    if (lastFailedIndex === -1) return
    const actualIndex = messages.length - 1 - lastFailedIndex
    const previousUserMsg = [...messages].slice(0, actualIndex).reverse().find((m) => m.role === 'user')
    if (previousUserMsg) {
      setMessages((prev) => prev.filter((_, i) => i !== actualIndex))
      sendMessage(previousUserMsg.content)
    }
  }, [messages, sendMessage])

  // ── Submit handler ──
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const hasMessages = messages.length > 0
  const lastMessageIsError = messages.length > 0 && messages[messages.length - 1].isError

  // ── User initials for avatar ──
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setView('dashboard')}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9 border border-emerald-200 dark:border-emerald-800">
          <AvatarFallback className="bg-emerald-600 text-white text-sm font-semibold">
            <Leaf className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold leading-tight truncate">TaxMind AI Advisor</h1>
          <p className="text-xs text-muted-foreground truncate">Pakistan Tax Law Expert</p>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400 text-[10px]"
        >
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Online
        </Badge>
        {/* New action buttons */}
        {hasMessages && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSummarize}
              disabled={isSummarizing || messages.length < 2}
              title="AI Summary"
            >
              <FileText className={`h-4 w-4 ${isSummarizing ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleExport}
              title="Export Chat"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearChat}
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Summary Banner */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 sm:px-6"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">AI Summary</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">{summary}</p>
              </div>
              <button onClick={() => setSummary('')} className="text-muted-foreground hover:text-foreground shrink-0">
                &times;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages / Empty State */}
      <div className="flex-1 min-h-0">
        {!hasMessages ? (
          /* ── Empty State ── */
          <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Leaf className="h-10 w-10 text-white" />
                </div>
                <motion.div
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-900"
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.div>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Ask me anything about{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Pakistan tax law
                  </span>
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                  I can help with ITO 2001 sections, FBR filing, deductions, capital gains, wealth statements, and
                  more.
                </p>
              </div>
            </motion.div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                  className="rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="mr-1.5 inline h-3 w-3" />
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Chat Messages ── */
          <ScrollArea ref={scrollRef} className="h-full">
            <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex items-start gap-3 ${
                      msg.role === 'user' ? 'flex-row-reverse max-w-[85%] sm:max-w-[70%] ml-auto' : 'max-w-[85%] sm:max-w-[70%]'
                    }`}
                  >
                    {/* Avatar */}
                    {msg.role === 'ai' ? (
                      <Avatar className="h-8 w-8 shrink-0 border border-emerald-200 dark:border-emerald-800">
                        <AvatarFallback className="bg-emerald-600 text-white text-xs">
                          <Leaf className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 shrink-0 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : msg.isError
                            ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                            : 'bg-card border shadow-sm rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:m-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-emerald-700 dark:[&_strong]:text-emerald-400 [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_code]:text-emerald-700 dark:[&_code]:text-emerald-400 [&_blockquote]:border-l-emerald-500 [&_blockquote]:text-muted-foreground [&_table]:text-xs">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={{ pre: ({ children }) => <>{children}</>, code: ({ children, className: cn, ...props }) => {
                            const isBlock = typeof children === 'string' && children.includes('\n')
                            if (isBlock) return <CodeBlock className={cn}>{children as string}</CodeBlock>
                            return (
                              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                {children}
                              </code>
                            )
                          } }}>
                            {msg.content}
                          </ReactMarkdown>
                          {msg.isError && (
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                                onClick={retryLastFailed}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Retry
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 sm:p-4">
        {/* Quick chips below when chat is active */}
        {hasMessages && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Pakistan tax law..."
            disabled={isLoading}
            className="flex-1 rounded-xl border-emerald-200 bg-muted/50 focus-visible:ring-emerald-500 dark:border-emerald-800"
            aria-label="Type your tax question"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0 h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            aria-label="Send message"
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

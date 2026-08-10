'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import {
  ArrowLeft,
  FileCheck,
  Send,
  RotateCcw,
 Trash2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_SUGGESTIONS = [
  'How do I file my first tax return?',
  'What documents do I need to file?',
  'Guide me through the IRIS portal',
  'When is the FBR filing deadline?',
  'What is a Wealth Statement?',
]

// ─── Animation ──────────────────────────────────────────────────

const messageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

const dotBounce = {
  animate: (i: number) => ({
    y: [0, -5, 0],
    transition: { duration: 0.4, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' },
  }),
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-blue-500"
          custom={i}
          variants={dotBounce}
          animate="animate"
        />
      ))}
    </div>
  )
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-sm text-blue-400">
      <code className={className}>{children}</code>
    </pre>
  )
}

// ─── Main Component ─────────────────────────────────────────────

export default function FilingAssistant() {
  const { setView } = useAppStore()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim()
      if (!msg || isLoading) return

      const userMsg: ChatMsg = { role: 'user', content: msg }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setInput('')
      setIsLoading(true)

      try {
        const history = updatedMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))

        const res = await fetch('/api/ai/filing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history }),
        })

        const json = await res.json()
        if (!res.ok || !json.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
          return
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: json.data.reply }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Network error. Please check your connection and try again.' },
        ])
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    },
    [input, isLoading, messages]
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const clearChat = () => setMessages([])

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) {
      setMessages((prev) => prev.slice(0, -1))
      setTimeout(() => sendMessage(lastUser.content), 100)
    }
  }

  const hasMessages = messages.length > 0
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:px-6">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setView('dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <FileCheck className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold leading-tight truncate">AI Filing Assistant</h1>
          <p className="text-xs text-muted-foreground truncate">Step-by-step FBR return filing guide</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400 text-[10px]">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          Guide
        </Badge>
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 min-h-0">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                  <FileCheck className="h-10 w-10 text-white" />
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
                <h2 className="text-xl font-bold tracking-tight">
                  Step-by-Step{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Filing Guidance
                  </span>
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                  I will walk you through the entire FBR tax return filing process, from document collection to final submission.
                </p>
              </div>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {INITIAL_SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                  className="rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50 disabled:opacity-50"
                >
                  <ChevronRight className="mr-1 inline h-3 w-3" />
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea ref={scrollRef} className="h-full">
            <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    variants={messageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse max-w-[85%] sm:max-w-[70%] ml-auto' : 'max-w-[85%] sm:max-w-[70%]'}`}
                  >
                    {msg.role === 'assistant' ? (
                      <Avatar className="h-8 w-8 shrink-0 border border-blue-200 dark:border-blue-800">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          <FileCheck className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8 shrink-0 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">U</AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-card border shadow-sm rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-blue dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:m-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-blue-700 dark:[&_strong]:text-blue-400 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_code]:text-blue-700 dark:[&_code]:text-blue-400 [&_blockquote]:border-l-blue-500 [&_table]:text-xs">
                          <ReactMarkdown
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              pre: ({ children }) => <>{children}</>,
                              code: ({ children, className: cn, ...props }) => {
                                const isBlock = typeof children === 'string' && children.includes('\n')
                                if (isBlock) return <CodeBlock className={cn}>{children as string}</CodeBlock>
                                return <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{children}</code>
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>{isLoading && <TypingDots />}</AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 sm:p-4">
        {hasMessages && (
          <div className="mb-2 flex gap-2">
            {INITIAL_SUGGESTIONS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
            <div className="flex-1" />
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="shrink-0 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about filing your tax return..."
            disabled={isLoading}
            className="flex-1 rounded-xl border-blue-200 bg-muted/50 focus-visible:ring-blue-500 dark:border-blue-800"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0 h-10 w-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? <Skeleton className="h-4 w-4 rounded-full" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        {lastIsAssistant && (
          <div className="mx-auto max-w-3xl mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={retryLast} className="text-xs h-7">
              <RotateCcw className="mr-1 h-3 w-3" /> Retry last response
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

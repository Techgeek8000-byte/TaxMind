'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { MessageCircle, X, Send, Minimize2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app'

// ─── Types ──────────────────────────────────────────────────────

interface FloatingMsg {
  role: 'user' | 'assistant'
  content: string
}

// ─── Animation ──────────────────────────────────────────────────

const dotBounce = {
  animate: (i: number) => ({
    y: [0, -4, 0],
    transition: { duration: 0.35, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' },
  }),
}

// ─── Main Component ─────────────────────────────────────────────

export default function FloatingAIAssistant() {
  const { view } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<FloatingMsg[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus()
  }, [isOpen, isMinimized])

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  // Build context from current view
  const getPageContext = useCallback(() => {
    const contextMap: Record<string, string> = {
      calculator: 'The user is on the Tax Calculator page calculating their income tax liability.',
      'savings-score': 'The user is checking their tax optimization savings score.',
      'presumptive-tax': 'The user is comparing presumptive tax vs normal tax regimes.',
      scanner: 'The user is scanning a tax document for AI extraction.',
      reports: 'The user is viewing their past tax calculation reports.',
      guides: 'The user is reading FBR tax guides.',
      'ai-chat': 'The user is in the full AI tax advisor chat.',
      'ai-insights': 'The user is viewing their AI-generated tax insights.',
      'ai-compare': 'The user is comparing tax years.',
      'ai-filing': 'The user is using the AI filing assistant.',
      'iris-export': 'The user is exporting FBR IRIS XML.',
      'wealth-statement': 'The user is generating a wealth statement.',
      'tax-calendar': 'The user is viewing the tax deadline calendar.',
      'wht-calculator': 'The user is calculating withholding tax.',
      'capital-gains': 'The user is calculating capital gains tax.',
      dashboard: 'The user is on the main dashboard viewing their tax overview.',
    }
    return contextMap[view] || 'The user is browsing TaxMind Pakistan.'
  }, [view])

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim()
      if (!msg || isLoading) return

      const userMsg: FloatingMsg = { role: 'user', content: msg }
      const updated = [...messages, userMsg]
      setMessages(updated)
      setInput('')
      setIsLoading(true)

      try {
        const history = updated.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))

        const res = await fetch('/api/ai/floating-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, context: getPageContext(), history }),
        })

        const json = await res.json()
        if (json.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: json.data.reply }])
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Try the full AI Advisor for detailed help.' }])
        }
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error.' }])
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    },
    [input, isLoading, messages, getPageContext]
  )

  // Keep only last 20 messages
  useEffect(() => {
    if (messages.length > 20) setMessages((prev) => prev.slice(-20))
  }, [messages.length])

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Quick AI Help</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1 rounded hover:bg-white/20 transition-colors">
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setIsOpen(false); setMessages([]) }} className="p-1 rounded hover:bg-white/20 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">Ask me anything about Pakistan tax law</p>
                  <p className="text-[10px] text-muted-foreground mt-1">I know you&apos;re on the {view.replace(/-/g, ' ')} page</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="prose prose-xs dark:prose-invert max-w-none [&_p]:m-0 [&_strong]:text-emerald-700 dark:[&_strong]:text-emerald-400 [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400">
                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block h-1.5 w-1.5 rounded-full bg-emerald-500"
                      custom={i}
                      variants={dotBounce}
                      animate="animate"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex items-center gap-2 border-t p-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Quick tax question..."
                disabled={isLoading}
                className="h-8 text-xs rounded-lg"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized pill */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg hover:bg-emerald-700 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">AI Help</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px]">
              {messages.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB - always visible when authenticated */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  )
}

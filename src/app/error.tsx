'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-destructive/3 blur-3xl" />
      </div>

      <motion.div
        className="relative text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        >
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </motion.div>

        <motion.h1
          className="text-5xl font-extrabold tracking-tighter text-destructive/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Oops!
        </motion.h1>

        <motion.h2
          className="mt-2 text-2xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Something went wrong
        </motion.h2>

        <motion.p
          className="mt-4 text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          An unexpected error occurred. Don&apos;t worry — your data is safe.
          Try again or head back to the homepage.
        </motion.p>

        <motion.div
          className="mt-4 rounded-lg border border-border/50 bg-muted/50 px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p className="text-xs font-mono text-muted-foreground">
            Error reference: {error.digest || 'unknown'}
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

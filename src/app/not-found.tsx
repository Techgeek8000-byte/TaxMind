'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <motion.div
        className="relative text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        >
          <FileQuestion className="h-12 w-12 text-primary" />
        </motion.div>

        <motion.h1
          className="text-8xl font-extrabold tracking-tighter text-primary/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="mt-2 text-2xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="mt-4 text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <p className="text-xs text-muted-foreground/60">
            Need help?{' '}
            <button
              onClick={() => window.location.href = '/'}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Try our tax guides
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

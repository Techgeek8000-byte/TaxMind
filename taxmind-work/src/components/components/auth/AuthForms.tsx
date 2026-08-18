'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app'

interface AuthFormsProps {
  mode: 'login' | 'register'
  onSwitch: () => void
}

// ─── Zod Schemas ───────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const registerSchema = z
  .object({
    name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// ─── Animation Variants ────────────────────────────────────────
const formVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

// ─── Component ─────────────────────────────────────────────────
export default function AuthForms({ mode, onSwitch }: AuthFormsProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-8 dark:from-emerald-950/30 dark:to-teal-950/30">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <LoginForm onSwitch={onSwitch} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <RegisterForm onSwitch={onSwitch} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Login Form ────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormValues) {
    setServerError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Login failed. Please try again.')
        return
      }
      setUser({
        id: json.user.id,
        email: json.user.email,
        name: json.user.name || undefined,
        avatar: json.user.avatar || undefined,
      })
      setView('dashboard')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    setServerError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Google sign-in failed.')
        return
      }
      setUser({
        id: json.user.id,
        email: json.user.email,
        name: json.user.name || undefined,
        avatar: json.user.avatar || undefined,
      })
      setView('dashboard')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <Card className="shadow-lg border-emerald-200/50 dark:border-emerald-800/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <img src="/icon.svg" alt="TaxMind" className="h-12 w-12 mx-auto" />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your TaxMind Pakistan account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </motion.div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="login-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                disabled={isSubmitting}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                disabled={isSubmitting}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled
              className="text-sm text-muted-foreground cursor-not-allowed underline decoration-muted-foreground/30 hover:decoration-muted-foreground/50"
              title="Password reset is not yet available"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError('Google sign-in failed. Please try again.')}
          useOneTap
          text="continue_with"
          shape="rectangular"
          size="large"
          width="100%"
        />
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="font-medium text-primary hover:underline"
          >
            Register
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}

// ─── Register Form ─────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: RegisterFormValues) {
    setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Registration failed. Please try again.')
        return
      }
      setUser({
        id: json.user.id,
        email: json.user.email,
        name: json.user.name || undefined,
        avatar: json.user.avatar || undefined,
      })
      setView('dashboard')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    setServerError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Google sign-in failed.')
        return
      }
      setUser({
        id: json.user.id,
        email: json.user.email,
        name: json.user.name || undefined,
        avatar: json.user.avatar || undefined,
      })
      setView('dashboard')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <Card className="shadow-lg border-emerald-200/50 dark:border-emerald-800/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <img src="/icon.svg" alt="TaxMind" className="h-12 w-12 mx-auto" />
        </div>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join TaxMind Pakistan for smart tax management</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </motion.div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="reg-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-name"
                type="text"
                placeholder="Muhammad Ali"
                className="pl-10"
                disabled={isSubmitting}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                disabled={isSubmitting}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                className="pl-10 pr-10"
                disabled={isSubmitting}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reg-confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className="pl-10"
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setServerError('Google sign-in failed. Please try again.')}
          text="signup_with"
          shape="rectangular"
          size="large"
          width="100%"
        />
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/app'
import {
  Leaf,
  Menu,
  ScanLine,
  Calculator,
  Scale,
  FileBarChart,
  BookOpen,
  ShieldCheck,
  Check,
  X,
  Star,
  ArrowRight,
  Zap,
  Users,
  Globe,
  ChevronRight,
  Twitter,
  Linkedin,
  Facebook,
  FileText,
  TrendingUp,
  Building2,
  Wallet,
  ClipboardList,
  BrainCircuit,
  Send,
  Target,
  Lock,
  Cpu,
  Upload,
  Landmark,
  FileSearch,
  BadgeDollarSign,
  CircleHelp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Guides', href: '#guides' },
  { label: 'FAQ', href: '#faq' },
]

const features = [
  {
    icon: ScanLine,
    title: 'AI Document Scanner',
    description:
      'Upload CNIC, salary slips, bank statements & business records. Our AI extracts tax-relevant data instantly for FBR-compliant filing.',
  },
  {
    icon: Calculator,
    title: 'Tax Calculator',
    description:
      'Accurate income tax, wealth tax & capital gains tax calculations based on FBR ITO 2001 rates for TY 2024-2025.',
  },
  {
    icon: Scale,
    title: 'Legal Optimization',
    description:
      'Identify every legal deduction, exemption & credit under Pakistan tax law to minimize your liability within FBR rules.',
  },
  {
    icon: FileBarChart,
    title: 'Tax Reports',
    description:
      'Generate professional tax computation sheets, FBR-compliant returns & financial summaries ready for submission.',
  },
  {
    icon: BookOpen,
    title: 'Expert Guides',
    description:
      'Step-by-step guides for salaried individuals, AOP, companies & freelancers — written by Pakistani tax professionals.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Dashboard',
    description:
      'Bank-grade encryption protects your financial data. Your documents never leave our secure servers.',
  },
]

const comparisonData = [
  {
    feature: 'AI Document Scanning',
    taxmind: true,
    manual: false,
    accountant: false,
  },
  {
    feature: 'Tax Optimization',
    taxmind: 'Advanced AI',
    manual: false,
    accountant: 'Limited',
  },
  {
    feature: 'FBR Compliance',
    taxmind: '100% ITO 2001',
    manual: 'Risk of errors',
    accountant: 'Yes',
  },
  {
    feature: 'Time Required',
    taxmind: '< 15 minutes',
    manual: '3-5 hours',
    accountant: '1-3 days',
  },
  {
    feature: 'Cost (per filing)',
    taxmind: 'From PKR 0',
    manual: 'Free (time cost)',
    accountant: 'PKR 5,000-50,000',
  },
  {
    feature: 'Accuracy',
    taxmind: '99.5%+',
    manual: 'Variable',
    accountant: '95%+',
  },
]

const testimonials = [
  {
    name: 'Ahmed Raza',
    role: 'Chartered Accountant, Lahore',
    initials: 'AR',
    color: 'bg-emerald-600',
    quote:
      "TaxMind has transformed how I handle client filings. The AI scanner reads CNIC and bank statements flawlessly, saving me hours per client. It's the best investment for any CA practice in Pakistan.",
  },
  {
    name: 'Fatima Noor',
    role: 'E-commerce Business Owner, Karachi',
    initials: 'FN',
    color: 'bg-teal-500',
    quote:
      'As an online seller, I was always confused about sales tax and income tax obligations. TaxMind identified PKR 85,000 in legitimate deductions I was missing. My tax bill dropped significantly!',
  },
  {
    name: 'Imran Khan',
    role: 'Salaried Professional, Islamabad',
    initials: 'IK',
    color: 'bg-emerald-500',
    quote:
      'Filing my annual return used to be stressful. With TaxMind, I uploaded my salary certificate and the app handled everything — tax computation, FBR submission format, even the wealth statement. Done in 10 minutes.',
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: 'PKR 0',
    period: '/month',
    description: 'Perfect for getting started with basic tax calculations.',
    popular: false,
    features: [
      '1 tax calculation per month',
      'Basic income tax calculator',
      'TY 2024-2025 FBR rates',
      'Email support',
      'Tax guides (limited access)',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: 'PKR 2,999',
    period: '/month',
    description: 'For professionals who need full tax filing capabilities.',
    popular: true,
    features: [
      'Unlimited tax calculations',
      'AI document scanning (CNIC, slips, statements)',
      'FBR-compliant tax reports',
      'All tax type support (income, wealth, capital gains)',
      'Full expert guides library',
      'Legal optimization engine',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For firms and organizations with team requirements.',
    popular: false,
    features: [
      'Everything in Pro',
      'API access for integrations',
      'Team management dashboard',
      'Bulk filing for multiple clients',
      'Dedicated account manager',
      'Custom FBR report formats',
      'SLA-backed uptime guarantee',
    ],
    cta: 'Contact Sales',
  },
]

const faqItems = [
  {
    q: 'What is TaxMind and who is it for?',
    a: "TaxMind is Pakistan's first AI-powered tax optimization platform built for individuals, businesses, and tax professionals. Whether you're a salaried employee, freelancer, business owner, or Chartered Accountant, TaxMind simplifies FBR-compliant tax filing under the Income Tax Ordinance 2001.",
  },
  {
    q: 'How accurate is TaxMind?',
    a: 'TaxMind achieves 99.5%+ accuracy on tax computations. Our AI engine is trained on FBR rules, SROs, and circulars, and is validated by Chartered Accountants. Every calculation follows the Income Tax Ordinance 2001 and uses the latest Tax Year 2024-2025 rates. We also run automated cross-checks on every return before it is generated.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. Your data is protected with bank-grade AES-256 encryption at rest and TLS 1.3 in transit. We never share your data with third parties. CNIC numbers and financial documents are processed in isolated environments. Our infrastructure undergoes regular security audits, and we comply with international data protection best practices.',
  },
  {
    q: 'What AI providers are used?',
    a: 'TaxMind uses a combination of proprietary machine learning models and leading AI providers for document understanding and tax optimization. Our document scanner uses advanced OCR and NLP to extract data from CNICs, salary slips, bank statements, and business records. All AI processing happens within our secure infrastructure — your documents are never sent to external AI services.',
  },
  {
    q: 'Can I file my FBR return directly?',
    a: 'TaxMind generates FBR-compliant tax computation sheets and return forms ready for submission. Currently, you can download the completed forms and upload them directly to the FBR IRIS portal. We are working on direct FBR IRIS integration to enable one-click filing in the near future. Our reports follow FBR-prescribed formats so they are accepted without modification.',
  },
  {
    q: 'What is presumptive tax?',
    a: 'Presumptive tax (also called final tax or minimum tax) is a simplified tax regime under Sections 113-116 of the ITO 2001. It applies to specific sectors like importers, exporters, retailers, wholesalers, and contractors. Instead of computing actual profit, a fixed percentage of turnover is treated as taxable income. TaxMind automatically identifies if presumptive tax applies to your income and calculates the correct liability.',
  },
  {
    q: 'Does it support companies?',
    a: 'Yes! TaxMind supports all taxpayer categories including individuals, Association of Persons (AOP), and companies. For companies, we handle corporate tax rates, super tax calculations, minimum tax provisions under Section 113, and dividend tax. Our Enterprise plan includes bulk filing capabilities for accounting firms managing multiple corporate clients.',
  },
  {
    q: 'What is the wealth statement?',
    a: 'The Wealth Statement (Form WH) is a mandatory annual declaration filed with FBR that details all your assets (property, vehicles, bank balances, investments) and liabilities as of June 30th. It reconciles your wealth position with your declared income. TaxMind automatically generates your wealth statement by tracking your income, expenses, and asset declarations — ensuring full compliance with FBR requirements.',
  },
  {
    q: 'How does the document scanner work?',
    a: 'Our AI Document Scanner uses advanced optical character recognition (OCR) and natural language processing to extract tax-relevant data from your documents. Simply upload a photo or PDF of your CNIC, salary slip, bank statement, or business records. The AI identifies key fields — income amounts, tax deductions, exemptions, withholding tax — and auto-fills your tax computation. The entire process takes under 30 seconds per document.',
  },
  {
    q: 'Can I use it for AOP filing?',
    a: 'Yes. TaxMind fully supports Association of Persons (AOP) filing under Section 64 of the ITO 2001. Whether your AOP is a partnership firm, professional group, or any other association, our platform handles partner profit sharing, AOP tax rates, and generates the correct AOP return format. Each partner\'s individual tax liability is also computed separately.',
  },
  {
    q: 'Is TaxMind free?',
    a: 'TaxMind offers a generous Free plan that includes 1 tax calculation per month, a basic income tax calculator, and limited access to tax guides. For unlimited calculations, AI document scanning, FBR-compliant reports, and the legal optimization engine, our Pro plan is PKR 2,999/month. We also offer a Custom Enterprise plan for firms and organizations. All plans start with a free trial — no credit card required.',
  },
  {
    q: 'Is TaxMind compliant with FBR regulations?',
    a: 'Absolutely. TaxMind is built on the latest FBR Income Tax Ordinance 2001 rules, including Tax Year 2024-2025 rates. Our tax engine is regularly updated to reflect FBR SROs, circulars, and budget amendments. All generated reports follow FBR-prescribed formats.',
  },
  {
    q: 'Which tax types does TaxMind support?',
    a: 'TaxMind supports all major tax types under Pakistani law: Income Tax (salaried, business, capital gains, property), Wealth Tax, Super Tax, Sales Tax, and withholding tax computations. Our Pro plan covers all tax types with AI-powered optimization for each.',
  },
]

/* ------------------------------------------------------------------ */
/*  Animated Counter Component (requestAnimationFrame)                */
/* ------------------------------------------------------------------ */

interface CounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
}

function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
}: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      setCount(Number(current.toFixed(decimals)))

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [target, duration, decimals])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animate])

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Comparison Cell Helper                                            */
/* ------------------------------------------------------------------ */

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    )
  }
  if (value === 'Risk of errors') {
    return <span className="text-destructive text-sm">{value}</span>
  }
  return <span className="text-sm font-medium">{value}</span>
}

/* ------------------------------------------------------------------ */
/*  Step Number Badge for How It Works                                */
/* ------------------------------------------------------------------ */

function StepBadge({ number }: { number: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute h-14 w-14 rounded-full bg-primary/20 animate-pulse" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
        {number}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                      */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const setView = useAppStore((s) => s.setView)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===================== NAVBAR ===================== */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TaxMind" className="h-9 w-auto" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView('login')}>
              Login
            </Button>
            <Button size="sm" onClick={() => setView('register')}>
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="TaxMind" className="h-9 w-auto" />
                </div>
                <Separator />
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <Separator />
                <div className="flex flex-col gap-3">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setView('login')}
                    >
                      Login
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full"
                      onClick={() => setView('register')}
                    >
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
          {/* Additional ambient glow */}
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute top-40 right-0 h-[300px] w-[300px] rounded-full bg-primary/8 blur-3xl" />

          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} custom={0}>
                <Badge
                  variant="secondary"
                  className="mb-6 px-4 py-1.5 text-sm font-medium"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  FBR ITO 2001 Compliant — TY 2024-2025
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                variants={fadeInUp}
                custom={1}
              >
                Smart Tax Optimization{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  for Pakistan
                </span>
              </motion.h1>

              <motion.p
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
                variants={fadeInUp}
                custom={2}
              >
                File your FBR returns with confidence. AI-powered document scanning,
                legal tax optimization under ITO 2001, and automatic computation using
                the latest Tax Year 2024-2025 rates — all in one platform.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                variants={fadeInUp}
                custom={3}
              >
                <Button
                  size="lg"
                  className="h-12 px-8 text-base"
                  onClick={() => setView('register')}
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  onClick={() => {
                    document
                      .getElementById('features')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  View Demo
                </Button>
              </motion.div>

              <motion.div
                className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                variants={fadeInUp}
                custom={4}
              >
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  <span>FBR compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  <span>100,000+ users</span>
                </div>
              </motion.div>
            </motion.div>

            {/* =========== Animated Stat Counters =========== */}
            <motion.div
              className="mt-16 mx-auto max-w-4xl"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <motion.div
                  variants={fadeInUp}
                  custom={0}
                  className="group"
                >
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                      <AnimatedCounter target={26} suffix="+" />
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground font-medium">
                      Tax Optimization Strategies
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  custom={1}
                  className="group"
                >
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                      <AnimatedCounter target={29} />
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground font-medium">
                      Withholding Tax Types
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  custom={2}
                  className="group"
                >
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                      <AnimatedCounter target={100} suffix="%" />
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground font-medium">
                      Legal & FBR Compliant
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  custom={3}
                  className="group"
                >
                  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 md:p-6 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                      <AnimatedCounter target={5} />
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground font-medium">
                      Income Heads Covered
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================== DASHBOARD PREVIEW ===================== */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
          <div className="relative container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                See TaxMind in <span className="text-primary">Action</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                A powerful dashboard designed for Pakistan&apos;s tax system — no clutter, just results.
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto max-w-5xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              {/* Dashboard Mockup */}
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Window Chrome */}
                <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-md bg-background/80 border border-border/50 px-4 py-1 text-xs text-muted-foreground">
                      tax-mind.vercel.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard Content Mockup */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Taxable Income', value: 'PKR 2,450,000', change: '+12%', color: 'text-primary' },
                      { label: 'Tax Computed', value: 'PKR 347,500', change: '-8.2%', color: 'text-emerald-400' },
                      { label: 'Deductions Found', value: 'PKR 350,000', change: '+PKR 85K', color: 'text-primary' },
                      { label: 'Effective Rate', value: '14.2%', change: '-2.1%', color: 'text-emerald-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-border/40 bg-background/50 p-4">
                        <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold tracking-tight">{stat.value}</p>
                        <p className={`mt-0.5 text-xs font-medium ${stat.color}`}>{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart + Breakdown Row */}
                  <div className="grid md:grid-cols-5 gap-4">
                    {/* Fake Chart Area */}
                    <div className="md:col-span-3 rounded-xl border border-border/40 bg-background/50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold">Monthly Income vs Tax</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Income</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Tax</span>
                        </div>
                      </div>
                      {/* SVG Bar Chart */}
                      <svg viewBox="0 0 400 120" className="w-full h-auto" preserveAspectRatio="none">
                        {['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'].map((m, i) => {
                          const h1 = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 15
                          const h2 = h1 * (0.12 + Math.random() * 0.06)
                          return (
                            <g key={m}>
                              <rect x={i * 33 + 4} y={110 - h1} width={12} height={h1} rx={3} fill="currentColor" className="text-primary/40" />
                              <rect x={i * 33 + 18} y={110 - h2} width={12} height={h2} rx={3} fill="currentColor" className="text-emerald-400/60" />
                              <text x={i * 33 + 17} y={118} textAnchor="middle" className="fill-muted-foreground/60" fontSize="7">{m}</text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                    {/* Breakdown List */}
                    <div className="md:col-span-2 rounded-xl border border-border/40 bg-background/50 p-5">
                      <p className="text-sm font-semibold mb-3">Optimization Breakdown</p>
                      <div className="space-y-3">
                        {[
                          { label: 'Salary Income', pct: 65 },
                          { label: 'Business Income', pct: 20 },
                          { label: 'Property Income', pct: 10 },
                          { label: 'Other Income', pct: 5 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium">{item.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                                style={{ width: `${item.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Potential Savings</span>
                          <span className="text-sm font-bold text-primary">PKR 85,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================== TRUSTED BY ===================== */}
        <section className="relative py-12 md:py-16 border-y border-border/30 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.p
                className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8"
                variants={fadeInUp}
                custom={0}
              >
                Trusted by taxpayers & firms across Pakistan
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <motion.div
                  variants={fadeInUp}
                  custom={1}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      <AnimatedCounter target={1000} suffix="+" />
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Taxpayers
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  custom={2}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      <AnimatedCounter target={50} suffix="+" />
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Tax Firms
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  custom={3}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10">
                    <Wallet className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      PKR <AnimatedCounter target={500} suffix="M+" />
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      Taxes Optimized
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                How It <span className="text-primary">Works</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                File your FBR tax return in four simple steps. No tax expertise
                required — our AI handles the complexity.
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto max-w-5xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <div className="grid gap-8 md:grid-cols-4 relative">
                {/* Connector line (desktop only) */}
                <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

                {/* Step 1 */}
                <motion.div
                  variants={fadeInUp}
                  custom={0}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-5">
                    <StepBadge number={1} />
                  </div>
                  <Card className="h-full w-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-3">
                      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">Enter Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Input your salary, business income, property rent, capital gains,
                        or upload documents — our AI auto-fills the fields.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  variants={fadeInUp}
                  custom={1}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-5">
                    <StepBadge number={2} />
                  </div>
                  <Card className="h-full w-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-3">
                      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">Apply Deductions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        TaxMind identifies every legal deduction under ITO 2001 — charity,
                        pension, education, employer-provided benefits, and more.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  variants={fadeInUp}
                  custom={2}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-5">
                    <StepBadge number={3} />
                  </div>
                  <Card className="h-full w-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-3">
                      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">AI Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Our AI engine scans 26+ optimization strategies to minimize your
                        tax liability legally, including withholding tax adjustments.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  variants={fadeInUp}
                  custom={3}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-5">
                    <StepBadge number={4} />
                  </div>
                  <Card className="h-full w-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-3">
                      <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Send className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">File with FBR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Download FBR-compliant tax returns and wealth statements ready
                        for IRIS submission. Your ATL status is maintained.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================== FEATURES ===================== */}
        <section id="features" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Everything You Need for{' '}
                <span className="text-primary">FBR Tax Filing</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                From AI-powered document scanning to FBR-compliant report generation,
                TaxMind covers every aspect of Pakistani tax filing.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {features.map((feature, i) => (
                <motion.div key={feature.title} variants={fadeInUp} custom={i}>
                  <Card className="h-full transition-shadow hover:shadow-lg hover:shadow-primary/5 group">
                    <CardHeader>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== COMPARISON TABLE ===================== */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Why Choose <span className="text-primary">TaxMind</span>?
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                See how TaxMind compares to manual filing and traditional accountants
                for Pakistani tax compliance.
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto max-w-4xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              custom={0}
            >
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5">
                      <TableHead className="font-semibold">Feature</TableHead>
                      <TableHead className="font-semibold text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Leaf className="h-4 w-4 text-primary" />
                          TaxMind
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Manual Filing
                      </TableHead>
                      <TableHead className="font-semibold text-center hidden sm:table-cell">
                        Accountant
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((row) => (
                      <TableRow key={row.feature}>
                        <TableCell className="font-medium">
                          {row.feature}
                        </TableCell>
                        <TableCell className="text-center">
                          <ComparisonCell value={row.taxmind} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ComparisonCell value={row.manual} />
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <ComparisonCell value={row.accountant} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ===================== TESTIMONIALS ===================== */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Trusted by <span className="text-primary">Pakistani</span> Taxpayers
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                Hear from professionals and individuals who have simplified their
                FBR tax filing with TaxMind.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {testimonials.map((t, i) => (
                <motion.div key={t.name} variants={fadeInUp} custom={i}>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback className={`${t.color} text-white font-semibold text-sm`}>
                            {t.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {t.role}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== PRICING ===================== */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Simple, Transparent{' '}
                <span className="text-primary">Pricing</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                Start free and upgrade when you need more. All prices in Pakistani
                Rupees.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {pricingTiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  variants={fadeInUp}
                  custom={i}
                  className={tier.popular ? 'md:-mt-4 md:mb-[-16px]' : ''}
                >
                  <Card
                    className={`h-full relative flex flex-col ${
                      tier.popular
                        ? 'border-primary shadow-xl shadow-primary/10'
                        : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-extrabold">{tier.price}</span>
                        <span className="text-muted-foreground text-sm">
                          {tier.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                      <ul className="space-y-3">
                        {tier.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={() => setView('register')}
                      >
                        {tier.cta}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== GUIDES SECTION ===================== */}
        <section id="guides" className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Expert Tax <span className="text-primary">Guides</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                Comprehensive guides written by Pakistani tax professionals to help
                you navigate FBR regulations with ease.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {[
                {
                  title: 'Income Tax Filing for Salaried Individuals',
                  desc: 'Step-by-step guide to filing your salary return under Section 12 of ITO 2001.',
                  tag: 'Salaried',
                  icon: Users,
                },
                {
                  title: 'Business & AOP Tax Returns',
                  desc: 'Complete guide for Association of Persons and sole proprietors filing under ITO 2001.',
                  tag: 'Business',
                  icon: Globe,
                },
                {
                  title: 'Capital Gains Tax on Property',
                  desc: 'Understand CGT rates, holding periods, and exemptions for immovable property in Pakistan.',
                  tag: 'Property',
                  icon: Calculator,
                },
                {
                  title: 'Freelancer Tax Guide — IT & ITES',
                  desc: 'Special tax rates for IT freelancers, PSEB registration, and FBR compliance requirements.',
                  tag: 'Freelancer',
                  icon: Zap,
                },
              ].map((guide, i) => (
                <motion.div
                  key={guide.title}
                  variants={fadeInUp}
                  custom={i}
                >
                  <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5 group">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {guide.tag}
                        </Badge>
                        <guide.icon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      <CardTitle className="text-sm leading-snug">
                        {guide.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {guide.desc}
                      </p>
                      <div className="mt-3 flex items-center text-xs font-medium text-primary">
                        Read guide
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                variants={fadeInUp}
                custom={0}
              >
                Frequently Asked{' '}
                <span className="text-primary">Questions</span>
              </motion.h2>
              <motion.p
                className="mt-4 text-muted-foreground text-lg"
                variants={fadeInUp}
                custom={1}
              >
                Got questions about TaxMind and Pakistani tax filing? We have
                answers.
              </motion.p>
            </motion.div>

            <motion.div
              className="mx-auto max-w-3xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              custom={0}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm md:text-base">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10 md:p-16 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInUp}
              custom={0}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/5 to-transparent" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                  Ready to Simplify Your FBR Tax Filing?
                </h2>
                <p className="mt-4 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                  Join over 100,000 Pakistani taxpayers who trust TaxMind for
                  accurate, optimized, and FBR-compliant tax returns.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 text-base"
                    onClick={() => setView('register')}
                  >
                    Start Free Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  Tax<span className="text-primary">Mind</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pakistan&apos;s leading AI-powered tax optimization platform.
                FBR ITO 2001 compliant.
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </Button>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#guides" className="hover:text-foreground transition-colors">
                    Tax Guides
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Tax Types</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Income Tax
                  </span>
                </li>
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Wealth Tax
                  </span>
                </li>
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Capital Gains Tax
                  </span>
                </li>
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Sales Tax
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="hover:text-foreground transition-colors cursor-pointer">
                    Data Security
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} TaxMind Pakistan. All rights reserved.
            </p>
            <p>
              Built for Pakistani taxpayers. Not affiliated with FBR.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

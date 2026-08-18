'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import {
  BookOpen,
  ArrowLeft,
  Briefcase,
  Building2,
  Home,
  TrendingUp,
  FileCheck,
  Lightbulb,
  Loader2,
  Clock,
  ChevronRight,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import { useAppStore } from '@/store/app'

// ─── Types ────────────────────────────────────────────────────────────────
interface TaxGuide {
  id: string
  slug: string
  title: string
  description: string
  content: string
  category: string
  order: number
  createdAt?: string
  updatedAt?: string
}

interface SeedGuide {
  slug: string
  title: string
  description: string
  content: string
  category: string
  order: number
}

// ─── Constants ────────────────────────────────────────────────────────────
const GUIDE_CATEGORIES = [
  { value: 'all', label: 'All Guides' },
  { value: 'Salary Tax', label: 'Salary Tax', icon: Briefcase },
  { value: 'Business Tax', label: 'Business Tax', icon: Building2 },
  { value: 'Property Tax', label: 'Property Tax', icon: Home },
  { value: 'Capital Gains', label: 'Capital Gains', icon: TrendingUp },
  { value: 'FBR Filing', label: 'FBR Filing', icon: FileCheck },
  { value: 'Tax Planning', label: 'Tax Planning', icon: Lightbulb },
] as const

const SEED_GUIDES: SeedGuide[] = [
  {
    slug: 'complete-salary-tax-guide-pakistan-2024-2025',
    title: 'Complete Salary Tax Guide Pakistan TY 2024-2025',
    description:
      'Everything you need to know about salary income taxation in Pakistan for Tax Year 2024-2025 under the FBR Income Tax Ordinance 2001.',
    category: 'Salary Tax',
    order: 1,
    content: `## Salary Income Tax in Pakistan — TY 2024-2025

Salary income is one of the most common sources of taxable income in Pakistan. Under the Income Tax Ordinance (ITO) 2001, salary income is defined as any remuneration or benefits received by an employee from their employer or from a provident or other fund set up by the employer. This includes basic salary, bonuses, allowances (house rent, medical, conveyance), perquisites, and any amount credited to an unrecognized provident fund.

### FBR Tax Slabs for Salaried Individuals — TY 2024-2025

The Federal Board of Revenue (FBR) has defined the following tax slabs for salaried individuals for Tax Year 2024-2025:

- **PKR 0 to 600,000** — 0% tax
- **PKR 600,001 to 1,200,000** — 5% of the amount exceeding PKR 600,000
- **PKR 1,200,001 to 2,200,000** — PKR 30,000 + 15% of the amount exceeding PKR 1,200,000
- **PKR 2,200,001 to 3,200,000** — PKR 180,000 + 25% of the amount exceeding PKR 2,200,000
- **PKR 3,200,001 to 4,100,000** — PKR 430,000 + 30% of the amount exceeding PKR 3,200,000
- **Above PKR 4,100,000** — PKR 700,000 + 35% of the amount exceeding PKR 4,100,000

### Allowed Deductions Under ITO 2001

Salaried individuals can claim several deductions to reduce their taxable income. Section 60 allows up to 20% of taxable income for investment in approved pension funds. Section 61 provides a similar 20% limit for life insurance premiums. Education allowance under Section 63 (up to 5%) and health insurance under Section 64 (up to 5%) are also available. Charitable donations to approved institutions under Section 64A can be deducted up to 30% of taxable income. Additionally, employer contributions to recognized provident funds (Section 64D) and EOBI contributions (Section 64E) are fully deductible with no upper cap.

### Filing Requirements & Deadlines

Employers are required to deduct tax at source under Section 149 and file monthly withholding tax statements. Individual salaried taxpayers must file an annual return by September 30 (or the extended date as notified by FBR). Late filing attracts penalties under Section 182, and failure to file can result in additional tax at higher rates. It is advisable to obtain a Taxpayer Registration Number and file returns through the IRIS portal at fbr.gov.pk. Maintain all salary slips, bank statements, and deduction certificates for at least six years as required by law.`,
  },
  {
    slug: 'business-income-tax-fbr-rules-optimization',
    title: 'Business Income Tax — FBR Rules & Optimization',
    description:
      'A comprehensive guide to business income taxation, allowable expenses, and legal tax optimization strategies for Pakistani businesses.',
    category: 'Business Tax',
    order: 2,
    content: `## Business Income Tax — FBR Rules & Optimization

Business income in Pakistan is governed by Part III of the Second Schedule of the Income Tax Ordinance (ITO) 2001. Business income includes income from trade, commerce, manufacturing, profession, or vocation carried on by a taxpayer. This guide covers the essential rules, allowable deductions, and optimization strategies available to businesses under Pakistani tax law.

### Tax Rates for Business Income — TY 2024-2025

For non-salaried individuals and Association of Persons (AOPs), FBR applies the following progressive tax slabs:

- **PKR 0 to 600,000** — 0% tax
- **PKR 600,001 to 1,200,000** — 15% of the amount exceeding PKR 600,000
- **PKR 1,200,001 to 1,600,000** — PKR 90,000 + 20% of the amount exceeding PKR 1,200,000
- **PKR 1,600,001 to 3,200,000** — PKR 170,000 + 30% of the amount exceeding PKR 1,600,000
- **PKR 3,200,001 to 5,600,000** — PKR 650,000 + 40% of the amount exceeding PKR 3,200,000
- **Above PKR 5,600,000** — PKR 1,610,000 + 45% of the amount exceeding PKR 5,600,000

Companies are taxed at a flat rate of **29%** for banking companies and **20%** for other companies. A super tax of 4% is additionally levied on income exceeding PKR 10 million (applicable for TY 2022-2025).

### Allowable Business Expenses (ITO Sec 20-22)

Under Section 20 of the ITO, all expenses wholly and exclusively incurred for the purpose of earning business income are deductible. This includes rent, salaries, utilities, raw materials, repair and maintenance, depreciation on assets, interest on borrowed capital, bad debts, and professional fees. However, personal expenses, capital expenditures, and expenditures prohibited under Section 21 are not allowed. Disallowed expenses include payments without proper documentation, expenditures exceeding fair market value, and donations not made to approved institutions.

### Legal Optimization Strategies

Business owners can legally minimize their tax burden through several strategies. Proper documentation of all expenses is critical — maintain receipts, invoices, and bank records for every business transaction. Consider depreciation allowances under Section 22 for plant, machinery, and buildings. Investment in approved pension funds (Sec 60) and health insurance (Sec 64) provide additional deductions. For businesses with turnover exceeding PKR 100 million, the minimum tax rate of 1.25% applies — ensure your effective rate does not fall below this threshold. Engage a qualified tax advisor to review your annual tax position and identify all applicable deductions and exemptions.`,
  },
  {
    slug: 'property-tax-rental-income-capital-value-pakistan',
    title: 'Property Tax — Rental Income & Capital Value',
    description:
      'Understand property taxation in Pakistan including rental income rules, capital value tax, and property-related deductions.',
    category: 'Property Tax',
    order: 3,
    content: `## Property Tax — Rental Income & Capital Value

Property income is a significant source of revenue for FBR and is covered under Section 15 of the Income Tax Ordinance 2001. Property income encompasses rental income from both urban and rural immovable property, as well as income from the lease of buildings and apartments. Pakistan has recently introduced capital value-based property taxation in major cities like Islamabad, Lahore, and Karachi, significantly changing how property income is taxed.

### Rental Income Tax Rules

Rental income is computed by deducting allowable expenses from gross rent received. Under Section 15A, a flat one-fifth (20%) of the rent received is allowed as a repair and maintenance allowance, regardless of actual expenditure. Additionally, property owners can deduct actual expenses such as property tax paid to local authorities, insurance premiums, mortgage interest, ground rent, collection charges, and rent unpaid at the end of the tax year. The net rental income is then taxed at the non-salaried individual slab rates.

For properties in urban areas with an annual rental value exceeding PKR 200,000, a withholding tax of 15% is deducted at source under Section 155. This is adjustable against the final tax liability. Properties in certain categories — such as those rented to educational institutions, hospitals, or charitable organizations — may qualify for partial or full exemptions.

### Capital Value Tax (CVT) & Property Valuation

The Capital Value Tax regime requires property owners to declare property values at DC (Deputy Commissioner) rates or higher. In Islamabad, property values are fixed at 85% of FBR-determined market values. Property transactions attract advance tax under Section 236C (immovable property) and Section 236K (capital value of property). For the buyer, advance tax at 3% of FBR value (for filers) or 6% (for non-filers) is collected. Sellers pay CGT based on holding period — properties held for less than one year attract higher rates compared to those held longer.

### Optimization Tips for Property Income

Property owners can optimize their tax position by ensuring proper documentation of all rental income and expenses. Claim the mandatory 20% repair allowance under Section 15A even if actual repair costs are lower. Deduct property tax paid to local bodies, insurance premiums, and interest on mortgage loans. For property sold after a holding period exceeding six years, the entire capital gain may be exempt from tax. Consider splitting rental income among co-owners to utilize lower tax brackets. Engage a property tax consultant for complex transactions involving multiple properties or overseas ownership.`,
  },
  {
    slug: 'capital-gains-tax-securities-immovable-property',
    title: 'Capital Gains Tax on Securities & Immovable Property',
    description:
      'A detailed guide to capital gains taxation on stocks, securities, and immovable property in Pakistan with applicable rates and exemptions.',
    category: 'Capital Gains',
    order: 4,
    content: `## Capital Gains Tax on Securities & Immovable Property

Capital gains arise from the disposal of capital assets including listed securities, immovable property, and other investments. The taxation of capital gains in Pakistan has evolved significantly, particularly after the 2022 Finance Act which introduced stricter rules and enhanced rates. This guide covers CGT on both securities and immovable property under the Income Tax Ordinance 2001.

### Capital Gains on Listed Securities (Sec 37)

Capital gains on the disposal of listed securities are taxed differently based on the holding period:

- **Securities held up to 1 year** — 15% of the capital gain
- **Securities held more than 1 year but up to 2 years** — 12.5% of the capital gain
- **Securities held more than 2 years but up to 3 years** — 10% of the capital gain
- **Securities held more than 3 years** — 7.5% of the capital gain

These gains are computed by deducting the cost of acquisition from the sale proceeds. Brokerage charges, commission, and government levies paid on the transaction are also deductible. The Federal Board of Revenue (FBR) may specify exemptions for certain government bonds, mutual fund units, and pension fund investments.

### Capital Gains on Immovable Property (Sec 37(1A))

Capital gains on immovable property are subject to the following rate structure:

- **Property held up to 1 year** — 15% of the gain
- **Property held more than 1 year** — 12.5% of the gain (for filers), 15% for non-filers
- **Property held more than 6 years** — May qualify for exemption on specific property types

For properties acquired before July 1, 2024, the gain is calculated as the difference between sale proceeds and the higher of the cost of acquisition or the fair market value as of the specified date. Advance tax is collected under Section 236C at the time of property registration — 3% for filers and 6% for non-filers.

### Exemptions & Strategic Planning

Several exemptions are available under ITO 2001. Capital gains on the disposal of one's principal residence may be exempt if the property was owned for at least two years before sale. Gains reinvested in another residential property within one year before or two years after the sale may qualify for rollover relief. For securities, gains from mutual fund units held through voluntary pension funds may be exempt. Taxpayers should maintain detailed records of acquisition costs, improvement expenses, and sale proceeds for at least six years. Strategic timing of asset disposal can significantly reduce the CGT burden by utilizing the graduated holding period rates.`,
  },
  {
    slug: 'fbr-tax-filing-step-by-step-guide',
    title: 'FBR Tax Filing — Step by Step Guide',
    description:
      'Complete step-by-step guide to filing your income tax return with FBR Pakistan through the IRIS portal, including required documents and common mistakes.',
    category: 'FBR Filing',
    order: 5,
    content: `## FBR Tax Filing — Step by Step Guide

Filing your income tax return with the Federal Board of Revenue (FBR) is a legal obligation for every person whose income exceeds the threshold specified in the Income Tax Ordinance 2001. The process has been digitized through FBR's IRIS portal, making it relatively straightforward for most taxpayers. This guide walks you through every step of the filing process for Tax Year 2024-2025.

### Pre-Filing Preparation

Before logging into IRIS, gather all necessary documents: your CNIC, business registration certificate (if applicable), bank statements for the tax year, salary certificates from all employers, property ownership documents, investment certificates, Zakat deduction certificates, and tax withheld at source (CPR/CPRID) statements. Ensure you have your IRIS login credentials — if you don't have an account, visit the nearest FBR Regional Tax Office (RTO) with your CNIC to register. Active taxpayers can verify their status on the FBR website by checking the Active Taxpayers List (ATL).

### Step-by-Step IRIS Filing Process

**Step 1: Login to IRIS** — Visit iris.fbr.gov.pk and enter your CNIC and password. Use the "Forgot Password" option if needed. Two-factor authentication via SMS is now mandatory.

**Step 2: Select Return Form** — Choose the appropriate return form: **Individual (Domestic)** for salaried/business persons, **Individual (Foreign)** for overseas Pakistanis, or **Company** for corporate taxpayers. Most individuals use Form 114(1) for salaried income or Form 114(4) for business income.

**Step 3: Enter Income Details** — Navigate to the "Income" section and enter income from all heads: salary (Section 12), property (Section 15), business (Section 18), capital gains (Section 37), and other sources (Section 39). Each head has sub-sections for detailed income breakdown.

**Step 4: Declare Assets & Liabilities** — Complete the Wealth Statement (Section A) declaring all assets including property, vehicles, bank deposits, investments, and foreign assets. Declare all liabilities including loans and mortgages.

**Step 5: Compute Tax** — The IRIS system auto-computes your tax based on the entered income. Review the computation carefully and cross-check with your own calculations. Ensure all deductions under Sections 60-64E are properly claimed.

**Step 6: Pay Tax (if applicable)** — If the computed tax exceeds the tax already withheld at source, pay the balance through a PRAL-generated CPIN using any designated bank branch or online banking.

**Step 7: Submit & Print** — Review all sections, check the declaration box, and submit the return. Print the acknowledgment receipt and tax return for your records. The submitted return can be revised before the filing deadline.

### Common Mistakes to Avoid

Many taxpayers make errors that lead to notices and penalties. Common mistakes include: not declaring all bank accounts and foreign assets (now tracked via AEOI), under-reporting income (FBR has access to utility bills, vehicle registration, and property records), missing the September 30 deadline (which attracts a penalty of PKR 1,000 to PKR 40,000 under Section 182), and failing to reconcile withholding taxes with actual payments. Always double-check your ATL status before filing and ensure your name appears on the list within 15 days of return submission.`,
  },
  {
    slug: 'legal-tax-optimization-strategies-ito-2001',
    title: 'Legal Tax Optimization Strategies under ITO 2001',
    description:
      'Practical and legal tax optimization strategies available to Pakistani taxpayers under the Income Tax Ordinance 2001 to minimize tax liability.',
    category: 'Tax Planning',
    order: 6,
    content: `## Legal Tax Optimization Strategies under ITO 2001

Tax optimization is the legal practice of arranging your financial affairs to minimize tax liability without violating any provisions of the Income Tax Ordinance 2001. Unlike tax evasion, which is illegal, tax optimization leverages the deductions, exemptions, and incentives provided by Pakistani tax law. This guide outlines the most effective strategies available to individual taxpayers and businesses.

### Maximizing Deductions Under Sections 60-64E

The ITO 2001 provides ten deduction sections that can significantly reduce taxable income. **Section 60** (Pension Fund Investment) allows up to 20% of taxable income for contributions to approved pension funds like Voluntary Pension System (VPS). **Section 61** (Life Insurance) similarly allows 20% for life insurance premiums. **Section 62** (Zakat) provides unlimited deduction for Zakat paid through official channels. **Section 63** (Education) and **Section 64** (Health Insurance) each allow 5% of taxable income. **Section 64A** (Charity) permits up to 30% for donations to approved institutions — ensure the recipient is listed on FBR's approved panel.

For salaried individuals specifically, **Section 64B** (Domestic Travel) allows 2% of taxable income and **Section 64C** (Computer/IT Equipment) allows 3%. **Section 64D** (Employer Provident Fund) and **Section 64E** (EOBI) are fully deductible with no cap. Combining these deductions strategically can reduce taxable income by 30-40% for mid-income earners.

### Income Splitting & Family Tax Planning

Pakistan follows individual taxation (not joint taxation), meaning each family member is taxed separately on their own income. This creates opportunities for income splitting — distributing income-generating assets among family members in lower tax brackets. For example, rental income from jointly-owned property can be split among co-owners based on ownership share. Similarly, investment income from fixed deposits or dividends can be allocated to non-working spouses or adult children who have no other income. However, this must be genuine — FBR scrutinizes benami transactions under the Benami Transactions (Prohibition) Act 2017.

### Business & Investment Optimization

Business owners should maintain meticulous records of all expenses under Sections 20-22 to maximize allowable deductions. Consider timing of capital expenditures to maximize depreciation allowances under Section 22. Investment in government bonds, National Savings Certificates, and approved pension funds provides both deductions and tax-exempt returns. For property investors, holding assets beyond the exempt holding period eliminates CGT entirely. Businesses with turnover exceeding the minimum tax threshold should evaluate whether the presumptive tax regime (Section 113) is more beneficial than the normal tax regime.

### Year-End Tax Planning Tips

The best time for tax planning is before the fiscal year ends (June 30). Maximize pension contributions and life insurance premiums before June 30 to claim deductions for the year. Ensure all charitable donations are made to FBR-approved institutions and obtain proper receipts. Review your withholding tax (WHT) statements and verify they match your records. If you have multiple income sources, consider whether filing separate returns for each business or consolidating into one return is more advantageous. Finally, engage a qualified tax advisor — the cost of professional advice is itself deductible under Section 22.`,
  },
]

const CATEGORY_ICONS: Record<string, typeof Briefcase> = {
  'Salary Tax': Briefcase,
  'Business Tax': Building2,
  'Property Tax': Home,
  'Capital Gains': TrendingUp,
  'FBR Filing': FileCheck,
  'Tax Planning': Lightbulb,
}

const CATEGORY_COLORS: Record<string, string> = {
  'Salary Tax': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Business Tax': 'bg-blue-100 text-blue-700 border-blue-200',
  'Property Tax': 'bg-amber-100 text-amber-700 border-amber-200',
  'Capital Gains': 'bg-purple-100 text-purple-700 border-purple-200',
  'FBR Filing': 'bg-teal-100 text-teal-700 border-teal-200',
  'Tax Planning': 'bg-rose-100 text-rose-700 border-rose-200',
}

// ─── Animation Variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TaxGuides() {
  const { setView, selectedGuideSlug, setSelectedGuide } = useAppStore()
  const [guides, setGuides] = useState<TaxGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Fetch guides
  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/guides')
      if (!response.ok) throw new Error('Failed to fetch guides')
      const data: TaxGuide[] = await response.json()

      // Seed guides if none exist
      if (data.length === 0) {
        for (const guide of SEED_GUIDES) {
          await fetch('/api/guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guide),
          })
        }
        // Re-fetch after seeding
        const refetch = await fetch('/api/guides')
        const refetched = await refetch.json()
        setGuides(refetched)
      } else {
        setGuides(data)
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching guides:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  // Get selected guide
  const selectedGuide = useMemo(
    () => guides.find((g) => g.slug === selectedGuideSlug),
    [guides, selectedGuideSlug]
  )

  // Filter guides by category
  const filteredGuides = useMemo(
    () =>
      activeCategory === 'all'
        ? guides
        : guides.filter((g) => g.category === activeCategory),
    [guides, activeCategory]
  )

  // ── Detail View ────────────────────────────────────────────────────
  if (selectedGuideSlug && selectedGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => setView('guides')}
              className="text-emerald-700 hover:bg-emerald-100 mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to All Guides
            </Button>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={CATEGORY_COLORS[selectedGuide.category] || ''}
              >
                {selectedGuide.category}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl">
              {selectedGuide.title}
            </h1>
            <p className="mt-2 text-sm text-emerald-600">{selectedGuide.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-emerald-200/60 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="prose prose-emerald max-w-none prose-headings:text-emerald-900 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-emerald-900 prose-ul:my-4 prose-ol:my-4 prose-li:my-1">
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{selectedGuide.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── List View ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('dashboard')}
              className="text-emerald-700 hover:bg-emerald-100"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl">
                Tax Guides
              </h1>
              <p className="text-sm text-emerald-600">
                Comprehensive guides on Pakistani tax law, FBR rules, and optimization strategies.
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full" orientation="horizontal">
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <TabsList className="flex w-full flex-wrap gap-1 bg-emerald-100/60 p-1 h-auto">
                {GUIDE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon || BookOpen
                  return (
                    <TabsTrigger
                      key={cat.value}
                      value={cat.value}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white sm:text-sm"
                    >
                      <Icon className="size-3.5" />
                      {cat.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </ScrollArea>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-emerald-200/60">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 bg-emerald-100" />
                  <Skeleton className="h-4 w-1/3 bg-emerald-100 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-emerald-100 mb-2" />
                  <Skeleton className="h-4 w-5/6 bg-emerald-100 mb-3" />
                  <Skeleton className="h-8 w-28 bg-emerald-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGuides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <BookOpen className="size-16 text-emerald-200 mb-4" />
            <h2 className="text-lg font-semibold text-emerald-800">No guides found</h2>
            <p className="text-sm text-emerald-600 mt-1">
              Try selecting a different category or check back later.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredGuides.map((guide) => {
              const CategoryIcon = CATEGORY_ICONS[guide.category] || BookOpen
              const categoryColor = CATEGORY_COLORS[guide.category] || ''

              return (
                <motion.div key={guide.id} variants={itemVariants}>
                  <Card className="group flex h-full flex-col border-emerald-200/60 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {guide.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={categoryColor}>
                          <CategoryIcon className="size-3 mr-1" />
                          {guide.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {guide.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-fit border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 group-hover:border-emerald-400"
                        onClick={() => setSelectedGuide(guide.slug)}
                      >
                        Read Guide
                        <ChevronRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

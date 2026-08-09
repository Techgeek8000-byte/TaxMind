// =============================================================================
// TaxMind Pakistan — Enhanced Tax Engine
// FBR Income Tax Ordinance 2001 | Tax Year 2024-2025
// =============================================================================

// ─── Section 1: Types & Interfaces ─────────────────────────────────────────

/** Standard income head classifications under ITO 2001 */
export type IncomeHead = 'salary' | 'business' | 'property' | 'capital_gains' | 'other'

/** Extended entity types for company and non-individual taxation */
export type EntityType =
  | 'individual_salary'
  | 'individual_business'
  | 'aop'
  | 'company'
  | 'small_company'
  | 'banking_company'
  | 'it_export'
  | 'special_tech_zone'

/** Primary tax calculation input. All fields from the original API are preserved;
 *  `entityType` is optional — when omitted the engine falls back to `incomeHead`
 *  based slab selection (backward-compatible behaviour). */
export interface TaxInput {
  incomeHead: IncomeHead
  taxYear: string
  grossIncome: number
  // Deductions
  sec60InvestmentPension?: number
  sec61LifeInsurance?: number
  sec62Zakat?: number
  sec63Education?: number
  sec64HealthInsurance?: number
  sec64ACharity?: number
  sec64BDomesticTravel?: number
  sec64CComputerIT?: number
  sec64DEmployerProvidentFund?: number
  sec64EEmployeeOldAge?: number
  sec65HouseBuildingLoan?: number
  isFemale?: boolean
  isSeniorCitizen?: boolean
  age?: number
  // Business specific
  businessExpenses?: number
  cogs?: number
  depreciation?: number
  // Property specific
  propertyExpenses?: number
  propertyType?: 'rent' | 'capital_value'
  propertyRepairAllowance?: number
  // Capital gains
  holdingPeriodMonths?: number
  assetType?: 'securities' | 'immovable_property' | 'other'
  // Entity type (optional — backward compatible)
  entityType?: EntityType
  // Filer status & identity
  isFiler?: boolean
  ntn?: string
  name?: string
  cnic?: string
}

/** Describes a single deduction section available to taxpayers */
export interface DeductionSection {
  section: string
  title: string
  maxLimit: number
  description: string
  itoRef: string
}

/** A single tax slab band */
export interface TaxSlab {
  min: number
  max: number
  rate: number
  fixed: number
}

/** Full tax computation result */
export interface TaxResult {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  taxComputed: number
  superTax: number
  minimumTax: number
  totalTax: number
  effectiveRate: number
  breakdown: {
    incomeHead: string
    slabs: { slab: string; rate: string; amount: number }[]
    deductions: { section: string; amount: number }[]
  }
}

/** Presumptive tax categories under Sections 113-116B */
export type PresumptiveTaxCategory =
  | 'retailer'
  | 'wholesaler'
  | 'distributor'
  | 'service_provider'
  | 'rice_mill'
  | 'maize_mill'
  | 'cotton_mill'
  | 'commercial_import'

/** Input for wealth statement reconciliation */
export interface WealthStatementInput {
  openingAssets: {
    property: number
    bankBalance: number
    investments: number
    vehicles: number
    businessCapital: number
    otherAssets: number
    totalLiabilities: number
  }
  declarations: {
    income: number
    gifts: number
    loansReceived: number
    remittances: number
    otherDeclarations: number
  }
  expenditures: {
    livingExpenses: number
    assetsPurchased: number
    loansRepaid: number
    taxesPaid: number
    otherExpenditures: number
  }
}

/** Wealth statement reconciliation result */
export interface WealthStatementResult {
  openingWealth: number
  closingWealth: number
  difference: number
  isBalanced: boolean
  items: {
    category: string
    amount: number
    type: 'opening' | 'addition' | 'subtraction' | 'closing'
  }[]
}

/** Single strategy entry returned by the savings score engine */
export interface SavingsStrategy {
  id: number
  title: string
  section: string
  potentialSavingPKR: number
  riskLevel: 'low' | 'medium' | 'high'
  description: string
  action: string
}

/** Composite savings score result */
export interface SavingsScoreResult {
  score: number
  totalPotentialSaving: number
  currentTax: number
  optimizedTax: number
  strategies: SavingsStrategy[]
}

/** Withholding tax calculation result */
export interface WithholdingTaxResult {
  rate: number
  tax: number
  section: string
}

/** Capital gains tax calculation result */
export interface CapitalGainsResult {
  tax: number
  rate: number
  holdingPeriodDiscount: string
}

// ─── Section 2: Constants — Deduction Sections ─────────────────────────────

export const DEDUCTION_SECTIONS: DeductionSection[] = [
  { section: 'Sec 60', title: 'Investment in Pension Fund', maxLimit: 0.2, description: 'Investment in approved pension fund schemes — up to 20% of taxable income deductible under ITO 2001 Section 60. Covers Voluntary Pension Schemes (VPS) approved by SECP.', itoRef: 'ITO Sec 60' },
  { section: 'Sec 61', title: 'Life Insurance Premium', maxLimit: 0.2, description: 'Premium paid on life insurance policies issued by approved insurers — up to 20% of taxable income deductible under ITO 2001 Section 61.', itoRef: 'ITO Sec 61' },
  { section: 'Sec 62', title: 'Zakat Deduction', maxLimit: 0, description: 'Zakat paid through officially recognised channels and approved Zakat collection agencies — unlimited deduction with no upper cap under ITO 2001 Section 62.', itoRef: 'ITO Sec 62' },
  { section: 'Sec 63', title: 'Education Allowance', maxLimit: 0.05, description: 'Tuition fees paid for children at recognised educational institutions — up to 5% of taxable income deductible under ITO 2001 Section 63.', itoRef: 'ITO Sec 63' },
  { section: 'Sec 64', title: 'Health Insurance Premium', maxLimit: 0.05, description: 'Premium paid for health insurance policies from SECP-approved insurers — up to 5% of taxable income deductible under ITO 2001 Section 64.', itoRef: 'ITO Sec 64' },
  { section: 'Sec 64A', title: 'Charitable Donations', maxLimit: 0.3, description: 'Donations to institutions approved under clause 58 of Part I of the Second Schedule — up to 30% of taxable income deductible under ITO 2001 Section 64A.', itoRef: 'ITO Sec 64A' },
  { section: 'Sec 64B', title: 'Domestic Travel', maxLimit: 0.02, description: 'Domestic travel expenses for business or personal purposes — up to 2% of taxable income deductible under ITO 2001 Section 64B.', itoRef: 'ITO Sec 64B' },
  { section: 'Sec 64C', title: 'Computer / IT Equipment', maxLimit: 0.03, description: 'Purchase of computers, laptops, printers, and IT equipment — up to 3% of taxable income deductible under ITO 2001 Section 64C.', itoRef: 'ITO Sec 64C' },
  { section: 'Sec 64D', title: 'Employer Provident Fund', maxLimit: 0, description: 'Employer contribution to a recognised provident fund — fully deductible under ITO 2001 Section 64D. No upper limit applies.', itoRef: 'ITO Sec 64D' },
  { section: 'Sec 64E', title: 'Employee Old Age Benefits', maxLimit: 0, description: 'Contributions to the Employees Old Age Benefits Institution (EOBI) — fully deductible under ITO 2001 Section 64E. No upper limit applies.', itoRef: 'ITO Sec 64E' },
  { section: 'Sec 65', title: 'House Building Loan Interest', maxLimit: 0.25, description: 'Interest on loan for construction/purchase of house property', itoRef: 'ITO Sec 65' },
]

// ─── Section 3: Tax Slabs (TY 2024-2025) ──────────────────────────────────

// TY 2024-2025 Salaried Individual Tax Slabs (FBR) — 9 tiers
const SALARY_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, rate: 0, fixed: 0 },
  { min: 600000, max: 1200000, rate: 0.05, fixed: 0 },
  { min: 1200000, max: 2200000, rate: 0.15, fixed: 60000 },
  { min: 2200000, max: 3200000, rate: 0.25, fixed: 210000 },
  { min: 3200000, max: 4100000, rate: 0.30, fixed: 460000 },
  { min: 4100000, max: 5500000, rate: 0.35, fixed: 730000 },
  { min: 5500000, max: 8000000, rate: 0.40, fixed: 1220000 },
  { min: 8000000, max: 12000000, rate: 0.45, fixed: 2220000 },
  { min: 12000000, max: 0, rate: 0.50, fixed: 4020000 },
]

// TY 2024-2025 Non-Salaried Individual / AOP Tax Slabs
const NON_SALARY_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, rate: 0, fixed: 0 },
  { min: 600000, max: 1200000, rate: 0.15, fixed: 0 },
  { min: 1200000, max: 1600000, rate: 0.20, fixed: 90000 },
  { min: 1600000, max: 3200000, rate: 0.30, fixed: 170000 },
  { min: 3200000, max: 5600000, rate: 0.40, fixed: 650000 },
  { min: 5600000, max: 0, rate: 0.45, fixed: 1610000 },
]

// TY 2024-2025 Company Tax Rates
const COMPANY_RATES: Record<string, { rate: number; label: string }> = {
  small_company: { rate: 0.20, label: 'Small Company (turnover < PKR 250M)' },
  company: { rate: 0.29, label: 'Private Limited Company' },
  banking_company: { rate: 0.39, label: 'Banking Company' },
  it_export: { rate: 0.01, label: 'IT Export Company (first 3 years)' },
  special_tech_zone: { rate: 0.005, label: 'Special Technology Zone (STZA)' },
}

// ─── Section 4: PKR Formatting (South Asian Numbering) ────────────────────

/**
 * Format a number using the South Asian (Indian/Pakistani) numbering system.
 * Groups digits as: …, Crore, Lakh, Thousand, Units.
 *
 * Examples:
 *   12345678   → "1,23,45,678"    (1 crore 23 lakh 45 thousand 678)
 *   100000     → "1,00,000"       (1 lakh)
 *   10000000   → "1,00,00,000"    (1 crore)
 *   999        → "999"
 */
export function formatPKR(n: number): string {
  if (n === 0) return '0'

  const isNeg = n < 0
  const abs = Math.abs(Math.round(n))
  const s = abs.toString()

  // Numbers up to 3 digits need no commas
  if (s.length <= 3) {
    return isNeg ? `-${s}` : s
  }

  // Last three digits form the final group (hundreds/tens/units)
  const last3 = s.slice(-3)
  const remaining = s.slice(0, -3)

  // Remaining digits are grouped in pairs from right to left
  const groups: string[] = []
  for (let i = remaining.length; i > 0; i -= 2) {
    const start = Math.max(0, i - 2)
    groups.unshift(remaining.slice(start, i))
  }
  groups.push(last3)

  const result = groups.join(',')
  return isNeg ? `-${result}` : result
}

/** @deprecated Use `formatPKR` instead. Kept as alias for backward compatibility. */
export const formatNum = formatPKR

// ─── Section 5: Internal Calculation Helpers ───────────────────────────────

/** Legacy slab calculator (unused in final path but preserved for reference) */
function calculateSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
  let tax = 0
  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break
    const taxableInSlab =
      slab.max === 0
        ? taxableIncome - slab.min
        : Math.min(taxableIncome, slab.max) - slab.min
    if (taxableInSlab > 0) {
      tax +=
        taxableInSlab * slab.rate +
        (taxableInSlab > 0 && slab.fixed > 0
          ? slab.fixed * (taxableInSlab / (slab.max === 0 ? taxableIncome - slab.min : slab.max - slab.min))
          : 0)
    }
  }
  return Math.round(tax)
}

/** Intermediate slab calculator (preserved for reference) */
function calcSlabTax(income: number, slabs: TaxSlab[]): number {
  let tax = 0
  for (const slab of slabs) {
    if (income <= slab.min) break
    const upper = slab.max === 0 ? income : Math.min(income, slab.max)
    const amountInSlab = upper - slab.min
    if (amountInSlab > 0) {
      tax += amountInSlab * slab.rate
      if (slab.fixed > 0 && income > slab.max) {
        tax += slab.fixed
      }
    }
  }
  return Math.round(tax)
}

/** FBR-compliant slab tax calculator — used by the main `calculateTax` function */
function fbrSlabTax(taxableIncome: number, slabs: TaxSlab[]): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  for (const slab of slabs) {
    if (taxableIncome <= slab.min) break
    const upper = slab.max === 0 ? taxableIncome : Math.min(taxableIncome, slab.max)
    const amountInSlab = upper - slab.min
    tax += amountInSlab * slab.rate
  }
  // Add fixed amounts for each slab the income exceeds
  for (const slab of slabs) {
    if (slab.fixed > 0 && slab.max > 0 && taxableIncome > slab.max) {
      tax += slab.fixed
    }
  }
  return Math.round(tax)
}

/** Sum up all declared deductions, respecting per-section caps */
function calculateDeductions(input: TaxInput, taxableIncome: number): number {
  let total = 0
  const fields: (keyof TaxInput)[] = [
    'sec60InvestmentPension', 'sec61LifeInsurance', 'sec62Zakat', 'sec63Education',
    'sec64HealthInsurance', 'sec64ACharity', 'sec64BDomesticTravel', 'sec64CComputerIT',
    'sec64DEmployerProvidentFund', 'sec64EEmployeeOldAge', 'sec65HouseBuildingLoan',
  ]
  const limits: Record<string, number> = {
    sec60InvestmentPension: 0.2,
    sec61LifeInsurance: 0.2,
    sec62Zakat: Infinity,
    sec63Education: 0.05,
    sec64HealthInsurance: 0.05,
    sec64ACharity: 0.3,
    sec64BDomesticTravel: 0.02,
    sec64CComputerIT: 0.03,
    sec64DEmployerProvidentFund: Infinity,
    sec64EEmployeeOldAge: Infinity,
    sec65HouseBuildingLoan: 0.25,
  }
  for (const field of fields) {
    const value = input[field] as number | undefined
    if (value && value > 0) {
      const limit = limits[field]
      if (limit === Infinity) {
        total += value
      } else {
        total += Math.min(value, taxableIncome * limit)
      }
    }
  }
  return Math.round(total)
}

/** Derive the marginal tax rate for a given income level and entity type */
function getMarginalRate(
  incomeHead: IncomeHead,
  taxableIncome: number,
  entityType?: EntityType,
): number {
  if (entityType && COMPANY_RATES[entityType]) {
    return COMPANY_RATES[entityType].rate
  }
  const slabs = incomeHead === 'salary' ? SALARY_SLABS : NON_SALARY_SLABS
  let marginal = 0
  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      marginal = slab.rate
    }
  }
  return marginal
}

/** Determine which slab set to use based on entity type or income head */
function resolveSlabs(input: TaxInput): TaxSlab[] {
  if (input.entityType) {
    switch (input.entityType) {
      case 'individual_salary':
        return SALARY_SLABS
      case 'individual_business':
      case 'aop':
        return NON_SALARY_SLABS
      default:
        // Company types use flat rates — slabs returned for breakdown only
        return SALARY_SLABS
    }
  }
  switch (input.incomeHead) {
    case 'salary':
      return SALARY_SLABS
    case 'business':
    case 'property':
    case 'capital_gains':
    case 'other':
      return NON_SALARY_SLABS
    default:
      return SALARY_SLABS
  }
}

/** Check if the entity type is a company variant */
function isCompanyType(entityType?: EntityType): boolean {
  return (
    entityType === 'company' ||
    entityType === 'small_company' ||
    entityType === 'banking_company' ||
    entityType === 'it_export' ||
    entityType === 'special_tech_zone'
  )
}

// ─── Section 6: Presumptive Tax Regime (Sec 113-116B) ─────────────────────

const PRESUMPTIVE_RATES: Record<string, { rate: number; label: string; section: string }> = {
  retailer: { rate: 0.01, label: 'Retailer (turnover < PKR 100M)', section: 'Sec 113' },
  wholesaler: { rate: 0.015, label: 'Wholesaler / Distributor (turnover < PKR 100M)', section: 'Sec 113' },
  distributor: { rate: 0.015, label: 'Wholesaler / Distributor (turnover < PKR 100M)', section: 'Sec 113' },
  service_provider: { rate: 0.03, label: 'Service Provider (turnover < PKR 100M)', section: 'Sec 113' },
  rice_mill: { rate: 0.0125, label: 'Rice Mill', section: 'Sec 113' },
  maize_mill: { rate: 0.0125, label: 'Maize Mill', section: 'Sec 113' },
  cotton_mill: { rate: 0.0125, label: 'Cotton Mill', section: 'Sec 113' },
  commercial_import: { rate: 0.055, label: 'Other Commercial Imports', section: 'Sec 116B' },
}

/**
 * Calculate presumptive tax under Sections 113-116B.
 *
 * @param income  - Turnover / gross revenue
 * @param category - One of the supported presumptive tax categories
 * @returns Tax payable in PKR (rounded)
 * @throws Error if the category is not recognised
 */
export function calculatePresumptiveTax(income: number, category: string): number {
  const entry = PRESUMPTIVE_RATES[category]
  if (!entry) {
    throw new Error(
      `Unknown presumptive tax category: "${category}". ` +
        `Valid categories: ${Object.keys(PRESUMPTIVE_RATES).join(', ')}`,
    )
  }
  return Math.round(income * entry.rate)
}

// ─── Section 7: Main Tax Calculation ────────────────────────────────────────

function emptyResult(input: TaxInput): TaxResult {
  return {
    grossIncome: 0, totalDeductions: 0, taxableIncome: 0,
    taxComputed: 0, superTax: 0, minimumTax: 0, totalTax: 0,
    effectiveRate: 0,
    breakdown: { incomeHead: input.incomeHead, slabs: [], deductions: [] },
  }
}

/**
 * Core tax calculation — the public API entry point.
 *
 * When `entityType` is provided the engine uses the corresponding company flat
 * rate or the appropriate individual slabs.  When omitted (backward-compat)
 * the selection falls back to `incomeHead` exactly as before.
 */
export function calculateTax(input: TaxInput): TaxResult {
  const { grossIncome, incomeHead } = input
  if (!grossIncome || grossIncome <= 0) {
    return emptyResult(input)
  }

  // ── Deductions ──
  const totalDeductions = calculateDeductions(input, grossIncome)
  const taxableIncome = Math.max(0, grossIncome - totalDeductions)

  // ── Resolve slab set ──
  const slabs = resolveSlabs(input)

  // ── Compute base tax ──
  let taxComputed: number

  if (input.entityType && isCompanyType(input.entityType)) {
    // Company flat-rate taxation
    const companyRate = COMPANY_RATES[input.entityType]
    taxComputed = Math.round(taxableIncome * companyRate.rate)
  } else {
    // Individual / AOP progressive slab taxation
    taxComputed = fbrSlabTax(taxableIncome, slabs)
  }

  // ── Super tax (4% surcharge on tax for income > PKR 10M) ──
  const superTax =
    isCompanyType(input.entityType)
      ? Math.round(taxComputed * 0.04)          // companies always pay super tax
      : taxableIncome > 10000000
        ? Math.round(taxComputed * 0.04)
        : 0

  // ── Minimum tax ──
  const minimumTax =
    (incomeHead === 'business' || input.entityType === 'individual_business') && taxableIncome > 0
      ? Math.round(taxableIncome * 0.0125)
      : 0

  // ── Total tax ──
  const totalTax = Math.max(taxComputed + superTax, minimumTax)

  // ── Effective rate ──
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0

  // ── Slab breakdown ──
  let slabBreakdown: { slab: string; rate: string; amount: number }[]

  if (input.entityType && isCompanyType(input.entityType)) {
    const cr = COMPANY_RATES[input.entityType]
    slabBreakdown = [
      {
        slab: `${cr.label} — Flat Rate`,
        rate: `${(cr.rate * 100).toFixed(0)}%`,
        amount: taxComputed,
      },
    ]
  } else {
    slabBreakdown = slabs
      .filter((s) => taxableIncome > s.min)
      .map((s) => {
        const upper = s.max === 0 ? taxableIncome : Math.min(taxableIncome, s.max)
        const amount = upper - s.min
        return {
          slab: `PKR ${formatPKR(s.min)} - ${s.max === 0 ? 'above' : formatPKR(s.max)}`,
          rate: `${(s.rate * 100).toFixed(0)}%` + (s.fixed > 0 ? ` + PKR ${formatPKR(s.fixed)}` : ''),
          amount: Math.round(amount * s.rate),
        }
      })
  }

  // ── Deduction breakdown ──
  const deductionBreakdown = DEDUCTION_SECTIONS
    .map((d) => {
      const fieldMap: Record<string, keyof TaxInput> = {
        'Sec 60': 'sec60InvestmentPension',
        'Sec 61': 'sec61LifeInsurance',
        'Sec 62': 'sec62Zakat',
        'Sec 63': 'sec63Education',
        'Sec 64': 'sec64HealthInsurance',
        'Sec 64A': 'sec64ACharity',
        'Sec 64B': 'sec64BDomesticTravel',
        'Sec 64C': 'sec64CComputerIT',
        'Sec 64D': 'sec64DEmployerProvidentFund',
        'Sec 64E': 'sec64EEmployeeOldAge',
        'Sec 65': 'sec65HouseBuildingLoan',
      }
      const field = fieldMap[d.section]
      const val = field ? (input[field] as number | undefined) || 0 : 0
      if (val > 0)
        return {
          section: `${d.section}: ${d.title}`,
          amount: Math.min(val, d.maxLimit === 0 || d.maxLimit >= 1 ? val : taxableIncome * d.maxLimit),
        }
      return null
    })
    .filter(Boolean) as { section: string; amount: number }[]

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxComputed,
    superTax,
    minimumTax,
    totalTax,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    breakdown: {
      incomeHead,
      slabs: slabBreakdown,
      deductions: deductionBreakdown,
    },
  }
}

// ─── Section 8: Tax Optimization Strategies ─────────────────────────────────

/**
 * Comprehensive list of 26 tax optimization strategies available under
 * Pakistan's Income Tax Ordinance 2001. Strategies 1-14 are the original set;
 * strategies 15-22 cover advanced planning techniques;
 * strategies 23-26 cover filer status, housing loans, ADR, and STZA benefits.
 */
export const TAX_OPTIMIZATION_STRATEGIES = [
  // ── Original 14 strategies ──
  { id: 1, title: 'Maximize Pension Fund Contributions', section: 'Sec 60', description: 'Invest up to 20% of taxable income in approved pension funds for full deduction.', potentialSaving: 'Up to 20% of tax', applicableTo: ['salary', 'business'] as IncomeHead[] },
  { id: 2, title: 'Life Insurance Premium', section: 'Sec 61', description: 'Pay life insurance premiums to reduce taxable income by up to 20%.', potentialSaving: 'Up to 20% of tax', applicableTo: ['salary', 'business', 'other'] as IncomeHead[] },
  { id: 3, title: 'Zakat Through Official Channels', section: 'Sec 62', description: 'Pay Zakat through approved channels — unlimited deduction with no upper cap.', potentialSaving: 'Unlimited', applicableTo: ['salary', 'business', 'property', 'other'] as IncomeHead[] },
  { id: 4, title: 'Children Education Allowance', section: 'Sec 63', description: 'Claim up to 5% of taxable income for children education expenses.', potentialSaving: 'Up to 5% of tax', applicableTo: ['salary'] as IncomeHead[] },
  { id: 5, title: 'Health Insurance Premium', section: 'Sec 64', description: 'Get health insurance and deduct up to 5% of taxable income.', potentialSaving: 'Up to 5% of tax', applicableTo: ['salary', 'business'] as IncomeHead[] },
  { id: 6, title: 'Charitable Donations', section: 'Sec 64A', description: 'Donate to FBR-approved charitable institutions for up to 30% deduction.', potentialSaving: 'Up to 30% of tax', applicableTo: ['salary', 'business', 'property', 'other'] as IncomeHead[] },
  { id: 7, title: 'Domestic Travel Expenses', section: 'Sec 64B', description: 'Deduct up to 2% of taxable income for domestic travel.', potentialSaving: 'Up to 2% of tax', applicableTo: ['salary', 'business'] as IncomeHead[] },
  { id: 8, title: 'Computer/IT Equipment', section: 'Sec 64C', description: 'Purchase computer/IT equipment and deduct up to 3% of taxable income.', potentialSaving: 'Up to 3% of tax', applicableTo: ['salary', 'business'] as IncomeHead[] },
  { id: 9, title: 'Employer Provident Fund', section: 'Sec 64D', description: 'Employer contribution to recognized provident fund — unlimited deduction.', potentialSaving: 'Varies', applicableTo: ['salary'] as IncomeHead[] },
  { id: 10, title: 'EOBI Contributions', section: 'Sec 64E', description: 'Employee Old Age Benefits contributions are fully deductible.', potentialSaving: 'Varies', applicableTo: ['salary'] as IncomeHead[] },
  { id: 11, title: 'Business Expense Optimization', section: 'Sec 20-22', description: 'Properly document all legitimate business expenses to reduce business income.', potentialSaving: 'Varies', applicableTo: ['business'] as IncomeHead[] },
  { id: 12, title: 'Property Maintenance Deduction', section: 'Sec 15A', description: 'Claim 1/5 of rent received as repair/maintenance allowance for property income.', potentialSaving: '20% of rental income', applicableTo: ['property'] as IncomeHead[] },
  { id: 13, title: 'Capital Gains Tax Exemptions', section: 'Sec 37-38', description: 'Hold securities/property longer for reduced CGT rates. Stocks held >1 year may qualify for reduced rates.', potentialSaving: 'Up to 50% CGT', applicableTo: ['capital_gains'] as IncomeHead[] },
  { id: 14, title: 'Split Income Among Family', section: 'Sec 60-65E', description: 'Distribute income-generating assets among family members to utilize lower tax brackets.', potentialSaving: 'Significant', applicableTo: ['salary', 'business', 'property'] as IncomeHead[] },

  // ── New strategies 15-22 ──
  { id: 15, title: 'Section 111(4) Investment Scheme', section: 'Sec 111(4)', description: 'Invest undeclared income in specified sectors (industrial, housing, plant) and pay only 1-5% tax instead of normal rates. Ideal for whitening previously untaxed funds through productive investment.', potentialSaving: 'Up to 95% of tax on invested amount', applicableTo: ['business', 'other', 'capital_gains'] as IncomeHead[] },
  { id: 16, title: 'Presumptive vs Normal Tax Election', section: 'Sec 113-116B', description: 'Small businesses with turnover < PKR 100M can elect presumive tax regime (1-5.5%) instead of normal progressive rates (15-45%). Compare both and choose the lower liability.', potentialSaving: '10-40% of tax', applicableTo: ['business'] as IncomeHead[] },
  { id: 17, title: 'Accelerated Depreciation (Sec 23)', section: 'Sec 23', description: 'Claim 50-100% depreciation allowance in Year 1 for new plant, machinery, and equipment in specified industries. Reduces taxable business income substantially in the first year.', potentialSaving: 'Up to 100% of asset cost × marginal rate', applicableTo: ['business'] as IncomeHead[] },
  { id: 18, title: 'Loss Carry-Forward (Sec 57-58)', section: 'Sec 57-58', description: 'Carry forward business losses for up to 6 years and capital losses for up to 6 years to offset future income. Requires timely filing of returns for the loss year.', potentialSaving: 'Up to 100% of carried-forward losses × marginal rate', applicableTo: ['business', 'capital_gains'] as IncomeHead[] },
  { id: 19, title: 'Agricultural Income Exemption (Sec 41)', section: 'Sec 41', description: 'Income from agriculture is legally exempt from income tax under the Constitution. Properly classify and segregate agricultural income to reduce overall tax liability.', potentialSaving: '100% on agricultural income portion', applicableTo: ['business', 'other'] as IncomeHead[] },
  { id: 20, title: 'SEZ / Export Zone Benefits (Sec 100C)', section: 'Sec 100C', description: 'IT exporters and businesses operating in Special Economic Zones benefit from reduced tax rates (as low as 1%) and tax holidays. Register with relevant authorities to qualify.', potentialSaving: 'Up to 99% on export income', applicableTo: ['business'] as IncomeHead[] },
  { id: 21, title: 'Foreign Tax Credit (Sec 103)', section: 'Sec 103', description: 'Claim credit for income taxes paid to foreign governments on foreign-sourced income. Prevents double taxation and can significantly reduce Pakistan tax liability.', potentialSaving: 'Up to 100% of foreign tax paid (capped by PK tax)', applicableTo: ['salary', 'business', 'capital_gains', 'other'] as IncomeHead[] },
  { id: 22, title: 'Double Tax Treaty Shopping (Sec 104)', section: 'Sec 104', description: 'Leverage Pakistan\'s 50+ double taxation treaties for reduced withholding rates on dividends, royalties, interest, and technical service fees. Restructure payments through treaty-favourable jurisdictions.', potentialSaving: '5-30% on cross-border income', applicableTo: ['business', 'capital_gains', 'other'] as IncomeHead[] },

  // ── Strategies 23-26 (enhanced) ──
  { id: 23, title: 'Withholding Tax Filer Optimization', section: 'Sec 147-236', description: 'Maintain Active Taxpayer List (ATL) status to benefit from lower WHT rates. Non-filers pay 2x withholding rates on all transactions including property, vehicles, banking, and contracts.', potentialSaving: 'Up to 15% on transactional taxes', applicableTo: ['salary', 'business', 'property', 'capital_gains', 'other'] as IncomeHead[] },
  { id: 24, title: 'House Building Loan Interest', section: 'Sec 65', description: 'Interest paid on loans for construction or purchase of residential property is deductible up to 25% of gross income. Both conventional and Islamic mortgage profit payments qualify.', potentialSaving: 'Up to 25% of gross income × marginal rate', applicableTo: ['salary', 'business'] as IncomeHead[] },
  { id: 25, title: 'Alternative Dispute Resolution', section: 'Sec 100A-100D', description: 'Opt for ADR to resolve tax disputes. Cases resolved through ADR receive 50% reduction in penalties and default surcharges. Faster resolution than regular appeals.', potentialSaving: 'Up to 5% of disputed tax amount', applicableTo: ['salary', 'business', 'property', 'capital_gains', 'other'] as IncomeHead[] },
  { id: 26, title: 'Special Tech Zone (STZA) Benefits', section: 'STZA Act 2021', description: 'Companies operating in Special Technology Zones established under the STZA Act 2021 enjoy a 0.5% tax rate for 10 years. IT and ITeS companies with 70%+ export revenue qualify.', potentialSaving: 'Up to 28% on qualifying business income', applicableTo: ['business'] as IncomeHead[] },
]

// ─── Section 9: Tax Savings Score Engine ────────────────────────────────────

/**
 * Metadata used internally to evaluate each strategy's savings potential.
 * Not exported — consumers use `computeSavingsScore` instead.
 */
interface StrategyEval {
  id: number
  title: string
  section: string
  /** Max percentage of gross income that can be deducted / shifted */
  maxDeductionPct: number
  /** Whether this is a deduction-based strategy (vs rate-based) */
  isDeduction: boolean
  /** For rate-based strategies, estimated savings as fraction of tax */
  rateSavingFactor: number
  riskLevel: 'low' | 'medium' | 'high'
  description: string
  action: string
  applicableTo: IncomeHead[]
}

const STRATEGY_EVAL_TABLE: StrategyEval[] = [
  // ── Strategies 1-14 (original) ──
  { id: 1, title: 'Maximize Pension Fund Contributions', section: 'Sec 60', maxDeductionPct: 0.20, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Invest up to 20% of taxable income in an approved pension fund (VPS, PPA) to claim a full deduction. This is one of the safest and most effective tax-saving tools available to salaried and business individuals.', action: 'Open a Voluntary Pension System (VPS) account and contribute at least 20% of your taxable income before the tax year ends.', applicableTo: ['salary', 'business'] },
  { id: 2, title: 'Life Insurance Premium', section: 'Sec 61', maxDeductionPct: 0.20, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Pay premiums on life insurance policies issued by approved insurers. Up to 20% of taxable income can be deducted, providing both protection and tax savings.', action: 'Purchase or increase life insurance coverage from an SECP-approved insurer; ensure premium receipts are retained for filing.', applicableTo: ['salary', 'business', 'other'] },
  { id: 3, title: 'Zakat Through Official Channels', section: 'Sec 62', maxDeductionPct: 0.05, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Zakat paid through officially recognised channels (Zakat fund, approved charities) is fully deductible with no upper limit. A religious obligation that also saves tax.', action: 'Pay Zakat through bank deductions or approved Zakat collection centres and retain the certificates.', applicableTo: ['salary', 'business', 'property', 'other'] },
  { id: 4, title: 'Children Education Allowance', section: 'Sec 63', maxDeductionPct: 0.05, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Tuition fees paid for children\'s education at recognised institutions can be deducted up to 5% of taxable income.', action: 'Collect fee receipts from schools/universities and include them in your tax return under Sec 63.', applicableTo: ['salary'] },
  { id: 5, title: 'Health Insurance Premium', section: 'Sec 64', maxDeductionPct: 0.05, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Premiums paid for health insurance policies from SECP-approved insurers are deductible up to 5% of taxable income.', action: 'Obtain health insurance for yourself and dependents; retain premium payment certificates.', applicableTo: ['salary', 'business'] },
  { id: 6, title: 'Charitable Donations', section: 'Sec 64A', maxDeductionPct: 0.30, isDeduction: true, rateSavingFactor: 0, riskLevel: 'medium', description: 'Donations to FBR-approved charitable institutions and hospitals qualify for a deduction of up to 30% of taxable income.', action: 'Donate only to institutions listed on the FBR approved list; obtain tax exemption certificates (Musharika/Maqsad).', applicableTo: ['salary', 'business', 'property', 'other'] },
  { id: 7, title: 'Domestic Travel Expenses', section: 'Sec 64B', maxDeductionPct: 0.02, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Domestic travel costs (air, rail, road) for business or personal purposes are deductible up to 2% of taxable income.', action: 'Retain all boarding passes, tickets, and travel invoices throughout the tax year.', applicableTo: ['salary', 'business'] },
  { id: 8, title: 'Computer / IT Equipment', section: 'Sec 64C', maxDeductionPct: 0.03, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Purchase of computers, laptops, printers, and IT equipment for personal or business use is deductible up to 3% of taxable income.', action: 'Purchase IT equipment before year-end; retain invoices showing product descriptions and NTN of the seller.', applicableTo: ['salary', 'business'] },
  { id: 9, title: 'Employer Provident Fund', section: 'Sec 64D', maxDeductionPct: 0.10, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Employer contributions to a recognised provident fund are fully deductible. Negotiate with your employer to maximise this benefit.', action: 'Request your HR/finance department to increase the employer\'s contribution to the recognised provident fund.', applicableTo: ['salary'] },
  { id: 10, title: 'EOBI Contributions', section: 'Sec 64E', maxDeductionPct: 0.01, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Mandatory EOBI contributions are fully deductible. For employers, ensuring all employees are registered provides additional deduction.', action: 'Ensure EOBI registration is active and contributions are up to date; retain payment challans.', applicableTo: ['salary'] },
  { id: 11, title: 'Business Expense Optimization', section: 'Sec 20-22', maxDeductionPct: 0.15, isDeduction: true, rateSavingFactor: 0, riskLevel: 'medium', description: 'Properly document all legitimate business expenses — rent, utilities, salaries, marketing, repairs — to reduce assessable business income. Undocumented expenses are disallowed.', action: 'Maintain proper bookkeeping; ensure every expense has a receipt, invoice, or bank transfer record.', applicableTo: ['business'] },
  { id: 12, title: 'Property Maintenance Deduction', section: 'Sec 15A', maxDeductionPct: 0.20, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'One-fifth (1/5) of rent received can be claimed as a repair and maintenance allowance regardless of actual expenditure.', action: 'Claim 20% of gross rent as repair allowance in your property income schedule.', applicableTo: ['property'] },
  { id: 13, title: 'Capital Gains Tax Exemptions', section: 'Sec 37-38', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.25, riskLevel: 'medium', description: 'Hold securities listed on PSX for more than 1 year to qualify for reduced CGT rates. Immovable property held > 6 years may be exempt.', action: 'Review holding periods before selling; defer sales to cross the exemption threshold where possible.', applicableTo: ['capital_gains'] },
  { id: 14, title: 'Split Income Among Family', section: 'Sec 60-65E', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.15, riskLevel: 'high', description: 'Distribute income-generating assets (rental property, investments) among family members with lower or no income to utilise their tax brackets and personal allowances.', action: 'Gift income-producing assets to lower-earning family members; file separate returns for each. Ensure gifts are genuine and documented.', applicableTo: ['salary', 'business', 'property'] },

  // ── Strategies 15-22 (advanced) ──
  { id: 15, title: 'Section 111(4) Investment Scheme', section: 'Sec 111(4)', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.20, riskLevel: 'high', description: 'Invest previously undeclared income in specified sectors (industrial plant, housing, shares) and pay only 1-5% tax instead of normal progressive rates (up to 45%). The invested amount becomes white money.', action: 'Identify eligible sectors under SRO 111(4); route funds through banking channels; file declaration with the Commissioner.', applicableTo: ['business', 'other', 'capital_gains'] },
  { id: 16, title: 'Presumptive vs Normal Tax Election', section: 'Sec 113-116B', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.25, riskLevel: 'medium', description: 'Businesses with turnover < PKR 100M can opt for the Final Tax Regime (1-5.5% of turnover) instead of normal progressive rates (15-45%). Compare both regimes before filing.', action: 'Calculate tax under both regimes using the presumptive calculator; file the election with your return if FTR is lower.', applicableTo: ['business'] },
  { id: 17, title: 'Accelerated Depreciation (Sec 23)', section: 'Sec 23', maxDeductionPct: 0.10, isDeduction: true, rateSavingFactor: 0, riskLevel: 'medium', description: 'New plant and machinery in specified industries can claim 50-100% first-year depreciation instead of the normal 10-25%. Applicable to manufacturing, IT, and energy sectors.', action: 'Purchase eligible plant/machinery; claim accelerated depreciation in the year of acquisition; maintain fixed asset register.', applicableTo: ['business'] },
  { id: 18, title: 'Loss Carry-Forward (Sec 57-58)', section: 'Sec 57-58', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.10, riskLevel: 'medium', description: 'Business and capital losses can be carried forward for up to 6 tax years. Losses must be declared in the original return — belated or revised claims may be restricted.', action: 'Ensure losses are properly computed and declared in the return for the loss year; track unabsorbed losses and set off against future income.', applicableTo: ['business', 'capital_gains'] },
  { id: 19, title: 'Agricultural Income Exemption (Sec 41)', section: 'Sec 41', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.05, riskLevel: 'low', description: 'Income derived from agricultural operations (cultivation, produce sale) is constitutionally exempt. Segregate agricultural income from other sources to benefit from the exemption.', action: 'Maintain separate records for agricultural income; file it in the exempt income schedule of the return; do not mix with business income.', applicableTo: ['business', 'other'] },
  { id: 20, title: 'SEZ / Export Zone Benefits (Sec 100C)', section: 'Sec 100C', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.30, riskLevel: 'low', description: 'IT and IT-enabled service exporters operating from registered SEZs enjoy a 1% tax rate on export income. Additional customs and sales tax exemptions may apply.', action: 'Register with the SEZ authority; ensure at least 70% of revenue is from IT exports; maintain separate export invoicing.', applicableTo: ['business'] },
  { id: 21, title: 'Foreign Tax Credit (Sec 103)', section: 'Sec 103', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.05, riskLevel: 'medium', description: 'Taxes paid abroad on foreign-sourced income can be claimed as a credit against Pakistan tax liability. The credit is limited to the lower of foreign tax paid or PK tax on that income.', action: 'Obtain tax residency certificates and foreign tax payment receipts; claim the credit in the foreign income schedule of the return.', applicableTo: ['salary', 'business', 'capital_gains', 'other'] },
  { id: 22, title: 'Double Tax Treaty Shopping (Sec 104)', section: 'Sec 104', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.10, riskLevel: 'high', description: 'Pakistan has 50+ double taxation treaties that can reduce withholding rates on dividends (5-15%), royalties (5-15%), interest (10-15%), and technical fees (5-15%). Restructure cross-border payments accordingly.', action: 'Review applicable treaties for each cross-border transaction; obtain tax residency certificates; apply reduced rates at source through the FBR portal.', applicableTo: ['business', 'capital_gains', 'other'] },

  // ── Strategies 23-26 (enhanced) ──
  { id: 23, title: 'Withholding Tax Filer Optimization', section: 'Sec 147-236', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.15, riskLevel: 'low', description: 'Maintain Active Taxpayer List (ATL) status to benefit from lower WHT rates. Non-filers pay 2x withholding rates on all transactions including property, vehicles, banking, and contracts.', action: 'File your tax return before the due date to remain on the ATL; verify your ATL status on the FBR website before making major transactions.', applicableTo: ['salary', 'business', 'property', 'capital_gains', 'other'] },
  { id: 24, title: 'House Building Loan Interest', section: 'Sec 65', maxDeductionPct: 0.25, isDeduction: true, rateSavingFactor: 0, riskLevel: 'low', description: 'Interest paid on loans for construction or purchase of residential property is deductible up to 25% of gross income. Both conventional and Islamic mortgage profit payments qualify.', action: 'Obtain a house building loan from an approved bank; retain profit/markup payment certificates; claim the interest deduction in your return under Sec 65.', applicableTo: ['salary', 'business'] },
  { id: 25, title: 'Alternative Dispute Resolution', section: 'Sec 100A-100D', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.05, riskLevel: 'medium', description: 'Opt for ADR to resolve tax disputes. Cases resolved through ADR receive 50% reduction in penalties and default surcharges. Faster resolution than regular appeals.', action: 'File an ADR application with the Commissioner Inland Revenue within 30 days of receiving the assessment order; engage a tax counsel for the ADR proceedings.', applicableTo: ['salary', 'business', 'property', 'capital_gains', 'other'] },
  { id: 26, title: 'Special Tech Zone (STZA) Benefits', section: 'STZA Act 2021', maxDeductionPct: 0, isDeduction: false, rateSavingFactor: 0.28, riskLevel: 'low', description: 'Companies operating in Special Technology Zones established under the STZA Act 2021 enjoy a 0.5% tax rate for 10 years. IT and ITeS companies with 70%+ export revenue qualify.', action: 'Apply for STZA registration; ensure 70%+ revenue from IT/ITeS exports; establish operations within an approved Special Technology Zone.', applicableTo: ['business'] },
]

/**
 * Compute a 0-100 tax savings score along with a prioritised list of strategies.
 *
 * **Methodology:**
 * 1. Calculate current tax liability from the provided input.
 * 2. For every applicable strategy, estimate the maximum PKR saving if fully utilised.
 * 3. Apply deduction-based strategies cumulatively (capped at gross income) to find
 *    the optimised tax position, then layer on rate-based savings independently.
 * 4. The score is the percentage reduction from `currentTax` → `optimizedTax`.
 *
 * @returns Sorted strategies (highest saving first) plus aggregate metrics.
 */
export function computeSavingsScore(input: TaxInput): SavingsScoreResult {
  const currentResult = calculateTax(input)
  const currentTax = currentResult.totalTax
  const grossIncome = input.grossIncome

  // ── Edge case: zero or negative tax ──
  if (currentTax <= 0 || grossIncome <= 0) {
    return {
      score: 0,
      totalPotentialSaving: 0,
      currentTax: 0,
      optimizedTax: 0,
      strategies: [],
    }
  }

  const marginalRate = getMarginalRate(input.incomeHead, currentResult.taxableIncome, input.entityType)

  // ── Phase 1: Evaluate each applicable strategy ──
  const applicable = STRATEGY_EVAL_TABLE.filter((s) => s.applicableTo.includes(input.incomeHead))

  const evaluated: SavingsStrategy[] = applicable.map((s) => {
    let savingPKR = 0

    if (s.isDeduction && s.maxDeductionPct > 0) {
      // Deduction strategies: saving = max_deduction × marginal_rate
      savingPKR = Math.round(grossIncome * s.maxDeductionPct * marginalRate)
    } else if (s.rateSavingFactor > 0) {
      // Rate-based / structural strategies: saving = factor × current_tax
      savingPKR = Math.round(currentTax * s.rateSavingFactor)
    }

    return {
      id: s.id,
      title: s.title,
      section: s.section,
      potentialSavingPKR: savingPKR,
      riskLevel: s.riskLevel,
      description: s.description,
      action: s.action,
    }
  })

  // ── Phase 2: Cumulative optimisation ──
  // Sort by savings descending so highest-impact strategies are applied first.
  const sorted = [...evaluated].sort((a, b) => b.potentialSavingPKR - a.potentialSavingPKR)

  let cumulativeDeductionSaving = 0
  let cumulativeRateSaving = 0
  let deductionCapacityUsed = 0
  const maxDeductionCapacity = grossIncome * 0.95 // leave at least 5% as taxable

  for (const s of sorted) {
    const evalMeta = STRATEGY_EVAL_TABLE.find((e) => e.id === s.id)
    if (!evalMeta) continue

    if (evalMeta.isDeduction && evalMeta.maxDeductionPct > 0) {
      const maxDeductionAmount = grossIncome * evalMeta.maxDeductionPct
      const remainingCapacity = maxDeductionCapacity - deductionCapacityUsed
      const actualDeduction = Math.min(maxDeductionAmount, Math.max(0, remainingCapacity))
      cumulativeDeductionSaving += Math.round(actualDeduction * marginalRate)
      deductionCapacityUsed += actualDeduction
    } else if (evalMeta.rateSavingFactor > 0) {
      cumulativeRateSaving += s.potentialSavingPKR
    }
  }

  const totalPotentialSaving = cumulativeDeductionSaving + cumulativeRateSaving
  const optimizedTax = Math.max(0, currentTax - totalPotentialSaving)
  const score = Math.min(100, Math.round((totalPotentialSaving / currentTax) * 100))

  return {
    score,
    totalPotentialSaving,
    currentTax,
    optimizedTax,
    strategies: sorted,
  }
}

// ─── Section 10: Wealth Statement ───────────────────────────────────────────

/**
 * Generate a Pakistan FBR-compliant wealth statement reconciliation.
 *
 * The statement computes:
 * - **Opening Wealth** = Σ opening assets − total liabilities
 * - **Additions** during the year (income, gifts, loans, remittances)
 * - **Subtractions** during the year (living expenses, taxes, loan repayments)
 *   — *assets purchased are NOT subtractions from net wealth* (cash → asset transfer)
 * - **Closing Wealth** = opening + additions − subtractions
 * - **isBalanced** = closing wealth is non-negative
 *
 * @returns A reconciled wealth statement with itemised line items.
 */
export function generateWealthStatement(input: WealthStatementInput): WealthStatementResult {
  const { openingAssets, declarations, expenditures } = input

  // ── Opening wealth ──
  const openingWealth =
    openingAssets.property +
    openingAssets.bankBalance +
    openingAssets.investments +
    openingAssets.vehicles +
    openingAssets.businessCapital +
    openingAssets.otherAssets -
    openingAssets.totalLiabilities

  // ── Additions (inflows) ──
  const totalAdditions =
    declarations.income +
    declarations.gifts +
    declarations.loansReceived +
    declarations.remittances +
    declarations.otherDeclarations

  // ── Subtractions (outflows that reduce net wealth) ──
  // Note: assetsPurchased converts cash to asset — it does NOT reduce net wealth.
  const totalSubtractions =
    expenditures.livingExpenses +
    expenditures.loansRepaid +
    expenditures.taxesPaid +
    expenditures.otherExpenditures

  // ── Closing wealth ──
  const closingWealth = openingWealth + totalAdditions - totalSubtractions
  const difference = closingWealth - openingWealth
  const isBalanced = closingWealth >= 0

  // ── Build itemised line items ──
  const items: WealthStatementResult['items'] = [
    // Opening assets
    { category: 'Property', amount: openingAssets.property, type: 'opening' },
    { category: 'Bank Balance', amount: openingAssets.bankBalance, type: 'opening' },
    { category: 'Investments', amount: openingAssets.investments, type: 'opening' },
    { category: 'Vehicles', amount: openingAssets.vehicles, type: 'opening' },
    { category: 'Business Capital', amount: openingAssets.businessCapital, type: 'opening' },
    { category: 'Other Assets', amount: openingAssets.otherAssets, type: 'opening' },
    { category: 'Total Liabilities', amount: -openingAssets.totalLiabilities, type: 'opening' },
    { category: 'Opening Wealth (Net)', amount: openingWealth, type: 'opening' },

    // Additions
    { category: 'Income', amount: declarations.income, type: 'addition' },
    { category: 'Gifts Received', amount: declarations.gifts, type: 'addition' },
    { category: 'Loans Received', amount: declarations.loansReceived, type: 'addition' },
    { category: 'Remittances Received', amount: declarations.remittances, type: 'addition' },
    { category: 'Other Additions', amount: declarations.otherDeclarations, type: 'addition' },
    { category: 'Total Additions', amount: totalAdditions, type: 'addition' },

    // Subtractions
    { category: 'Living Expenses', amount: -expenditures.livingExpenses, type: 'subtraction' },
    { category: 'Assets Purchased', amount: -expenditures.assetsPurchased, type: 'subtraction' },
    { category: 'Loans Repaid', amount: -expenditures.loansRepaid, type: 'subtraction' },
    { category: 'Taxes Paid', amount: -expenditures.taxesPaid, type: 'subtraction' },
    { category: 'Other Expenditures', amount: -expenditures.otherExpenditures, type: 'subtraction' },
    { category: 'Total Subtractions', amount: -totalSubtractions, type: 'subtraction' },

    // Closing
    { category: 'Closing Wealth (Net)', amount: closingWealth, type: 'closing' },
  ]

  return { openingWealth, closingWealth, difference, isBalanced, items }
}

// ─── Section 11: FBR IRIS XML Generation ────────────────────────────────────

/**
 * Generate a simplified FBR IRIS-compatible XML structure for tax return
 * submission.  This is **not** a complete filing schema — it covers the core
 * computation fields and identity sections required for the return header.
 *
 * @param result - Tax computation result from `calculateTax()`
 * @param input  - Original tax input extended with optional identity fields
 * @returns A well-formed XML string
 */
export function generateIrisXML(
  result: TaxResult,
  input: TaxInput & { ntn?: string; name?: string; cnic?: string },
): string {
  const esc = (v: string | number | undefined): string => {
    if (v === undefined || v === null) return ''
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const taxYear = input.taxYear || new Date().getFullYear().toString()
  const now = new Date().toISOString().split('T')[0]

  const deductionXml = result.breakdown.deductions
    .map(
      (d) => `
      <Deduction>
        <Description>${esc(d.section)}</Description>
        <Amount>${d.amount}</Amount>
      </Deduction>`,
    )
    .join('')

  const slabXml = result.breakdown.slabs
    .map(
      (s) => `
      <Slab>
        <Range>${esc(s.slab)}</Range>
        <Rate>${esc(s.rate)}</Rate>
        <TaxAmount>${s.amount}</TaxAmount>
      </Slab>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<Return xmlns="http://FBR.GOV.PK/TaxReturn/IRIS" version="2.0">
  <ReturnHeader>
    <TaxYear>${esc(taxYear)}</TaxYear>
    <NTN>${esc(input.ntn)}</NTN>
    <Name>${esc(input.name)}</Name>
    <CNIC>${esc(input.cnic)}</CNIC>
    <FilingDate>${esc(now)}</FilingDate>
    <ReturnType>Original</ReturnType>
  </ReturnHeader>

  <TaxpayerInfo>
    <IncomeHead>${esc(result.breakdown.incomeHead)}</IncomeHead>
    <EntityType>${esc(input.entityType || 'individual')}</EntityType>
  </TaxpayerInfo>

  <IncomeTaxComputation>
    <GrossIncome>${result.grossIncome}</GrossIncome>
    <TotalDeductions>${result.totalDeductions}</TotalDeductions>
    <TaxableIncome>${result.taxableIncome}</TaxableIncome>
    <TaxComputed>${result.taxComputed}</TaxComputed>
    <SuperTax>${result.superTax}</SuperTax>
    <MinimumTax>${result.minimumTax}</MinimumTax>
    <TotalTaxPayable>${result.totalTax}</TotalTaxPayable>
    <EffectiveRate>${result.effectiveRate}%</EffectiveRate>
  </IncomeTaxComputation>

  <Deductions>${deductionXml}
  </Deductions>

  <SlabBreakdown>${slabXml}
  </SlabBreakdown>

  <Declaration>
    <Declared>true</Declared>
    <DeclarationDate>${esc(now)}</DeclarationDate>
  </Declaration>
</Return>`
}

// ─── Section 12: WHT Types Constant ──────────────────────────────────────────

/** All 29 withholding tax transaction types under ITO 2001 */
export const WHT_TYPES: {
  type: string
  label: string
  defaultRate: number
  section: string
}[] = [
  { type: 'bankProfit',          label: 'Bank Profit / Profit on Debt',       defaultRate: 0.15,  section: 'Sec 151' },
  { type: 'dividend',            label: 'Dividend Income',                    defaultRate: 0.15,  section: 'Sec 150' },
  { type: 'salary',              label: 'Salary (varies by slab)',            defaultRate: 0,     section: 'Sec 149' },
  { type: 'services',            label: 'Services / Consultancy',             defaultRate: 0.15,  section: 'Sec 153' },
  { type: 'goods',               label: 'Goods / Supplies (3-5%)',           defaultRate: 0.035, section: 'Sec 153' },
  { type: 'contract',            label: 'Contract / Sub-contract',            defaultRate: 0.07,  section: 'Sec 155' },
  { type: 'propertyRent',        label: 'Property Rent',                      defaultRate: 0.15,  section: 'Sec 155' },
  { type: 'exports',             label: 'Exports',                            defaultRate: 0.01,  section: 'Sec 154' },
  { type: 'imports',             label: 'Imports',                            defaultRate: 0.055, section: 'Sec 148' },
  { type: 'telephone',           label: 'Telephone / Mobile Bills',           defaultRate: 0.02,  section: 'Sec 232' },
  { type: 'electricity',         label: 'Electricity Bills',                  defaultRate: 0.05,  section: 'Sec 235' },
  { type: 'prizeWinnings',       label: 'Prize / Lottery Winnings',          defaultRate: 0.15,  section: 'Sec 156' },
  { type: 'livestock',           label: 'Livestock Purchase',                 defaultRate: 0.025, section: 'Sec 231A' },
  { type: 'propertyPurchase',    label: 'Property Purchase',                  defaultRate: 0.03,  section: 'Sec 236K' },
  { type: 'propertySale',        label: 'Property Sale',                      defaultRate: 0.02,  section: 'Sec 236C' },
  { type: 'vehiclePurchase',     label: 'Vehicle Purchase (3-10%)',          defaultRate: 0.05,  section: 'Sec 234' },
  { type: 'bankingTransaction',  label: 'Banking Transaction',                defaultRate: 0.006, section: 'Sec 231A' },
  { type: 'stockExchange',       label: 'Stock Exchange Transactions',        defaultRate: 0.001, section: 'Sec 236A' },
  { type: 'marriageHall',        label: 'Marriage Hall / Catering (5-10%)',   defaultRate: 0.07,  section: 'Sec 236G' },
  { type: 'professionalFee',     label: 'Professional Fee',                   defaultRate: 0.10,  section: 'Sec 236H' },
  { type: 'cableInternet',       label: 'Cable / Internet Services',          defaultRate: 0.08,  section: 'Sec 236I' },
  { type: 'educationFeePrivate', label: 'Private Education Fee',              defaultRate: 0.05,  section: 'Sec 236J' },
  { type: 'courierServices',     label: 'Courier / Freight Services',         defaultRate: 0.05,  section: 'Sec 236L' },
  { type: 'airfare',             label: 'Airfare',                            defaultRate: 0.01,  section: 'Sec 236M' },
  { type: 'foreignRemittance',   label: 'Foreign Remittance (Exempt)',        defaultRate: 0.00,  section: 'Sec 111' },
  { type: 'insurancePremium',    label: 'Insurance Premium',                  defaultRate: 0.05,  section: 'Sec 236N' },
  { type: 'commission',          label: 'Commission / Brokerage',             defaultRate: 0.10,  section: 'Sec 153' },
  { type: 'royalty',             label: 'Royalty / Technical Fee',            defaultRate: 0.15,  section: 'Sec 152' },
  { type: 'petroleumProducts',   label: 'Petroleum / Oil Products',           defaultRate: 0.06,  section: 'Sec 236O' },
]

// ─── Section 12b: Withholding Tax Calculator ─────────────────────────────────

/**
 * Calculate withholding tax for 29 transaction types under ITO 2001.
 *
 * @param type   - WHT transaction type key (e.g. 'bankProfit', 'dividend')
 * @param amount - Gross transaction amount in PKR
 * @returns Object with rate, computed tax, and applicable ITO section
 */
export function calculateWithholdingTax(type: string, amount: number): WithholdingTaxResult {
  const whtTypes: Record<string, { rate: number; section: string; compute?: (a: number) => number }> = {
    bankProfit:            { rate: 0.15, section: 'Sec 151' },
    dividend:              { rate: 0.15, section: 'Sec 150' },
    salary:                { rate: 0,    section: 'Sec 149', compute: (_a: number) => 0 }, // Varies by slab
    services:              { rate: 0.15, section: 'Sec 153' },
    goods:                 { rate: 0.035, section: 'Sec 153' },     // 3-5% — default 3.5%
    contract:              { rate: 0.07, section: 'Sec 155' },
    propertyRent:          { rate: 0.15, section: 'Sec 155' },
    exports:               { rate: 0.01, section: 'Sec 154' },
    imports:               { rate: 0.055, section: 'Sec 148' },
    telephone:             { rate: 0.02, section: 'Sec 232' },
    electricity:           { rate: 0.05, section: 'Sec 235' },
    prizeWinnings:         { rate: 0.15, section: 'Sec 156' },
    livestock:             { rate: 0.025, section: 'Sec 231A' },
    propertyPurchase:      { rate: 0.03, section: 'Sec 236K' },
    propertySale:          { rate: 0.02, section: 'Sec 236C' },     // 1-3% — default 2%
    vehiclePurchase:       { rate: 0.05, section: 'Sec 234' },      // 3-10% — default 5%
    bankingTransaction:    { rate: 0.006, section: 'Sec 231A' },
    stockExchange:         { rate: 0.001, section: 'Sec 236A' },
    marriageHall:          { rate: 0.07, section: 'Sec 236G' },     // 5-10% — default 7%
    professionalFee:       { rate: 0.10, section: 'Sec 236H' },
    cableInternet:         { rate: 0.08, section: 'Sec 236I' },
    educationFeePrivate:   { rate: 0.05, section: 'Sec 236J' },
    courierServices:       { rate: 0.05, section: 'Sec 236L' },
    airfare:               { rate: 0.01, section: 'Sec 236M' },
    foreignRemittance:     { rate: 0.00, section: 'Sec 111' },
    insurancePremium:      { rate: 0.05, section: 'Sec 236N' },
    commission:             { rate: 0.10, section: 'Sec 153' },
    royalty:                { rate: 0.15, section: 'Sec 152' },
    petroleumProducts:      { rate: 0.06, section: 'Sec 236O' },
  }

  const entry = whtTypes[type]
  if (!entry) {
    throw new Error(
      `Unknown withholding tax type: "${type}". ` +
        `Valid types: ${Object.keys(whtTypes).join(', ')}`,
    )
  }

  const rate = entry.rate
  const tax = Math.round(amount * rate)

  return { rate, tax, section: entry.section }
}

// ─── Section 13: Capital Gains Tax Calculator ───────────────────────────────

/**
 * Calculate capital gains tax based on asset type and holding period.
 *
 * Rates:
 * - Securities: <=12 months 15%, >12 months 12.5%
 * - Immovable property: <=12 months 15%, >12 months 12.5% (>6 years may be exempt)
 * - Other: 15%
 *
 * @param gain           - Capital gain amount in PKR
 * @param holdingMonths  - Number of months the asset was held
 * @param assetType      - Type of asset disposed
 * @returns Tax amount, applicable rate, and holding period discount description
 */
export function calculateCapitalGainsTax(
  gain: number,
  holdingMonths: number,
  assetType: 'securities' | 'immovable_property' | 'other',
): CapitalGainsResult {
  if (gain <= 0) {
    return { tax: 0, rate: 0, holdingPeriodDiscount: 'No gain' }
  }

  let rate: number
  let discount: string

  switch (assetType) {
    case 'securities':
      if (holdingMonths > 12) {
        rate = 0.125
        discount = 'Long-term holding (>12 months): reduced rate of 12.5%'
      } else {
        rate = 0.15
        discount = 'Short-term holding (<=12 months): standard rate of 15%'
      }
      break

    case 'immovable_property':
      if (holdingMonths > 72) {
        // >6 years — potentially exempt
        rate = 0
        discount = 'Held >6 years: potentially exempt from CGT (Sec 37(1A))'
      } else if (holdingMonths > 12) {
        rate = 0.125
        discount = 'Long-term holding (>12 months): reduced rate of 12.5%'
      } else {
        rate = 0.15
        discount = 'Short-term holding (<=12 months): standard rate of 15%'
      }
      break

    case 'other':
    default:
      rate = 0.15
      discount = 'Other assets: standard rate of 15%'
      break
  }

  return {
    tax: Math.round(gain * rate),
    rate,
    holdingPeriodDiscount: discount,
  }
}

// ─── Section 14: Super Tax Tiers ─────────────────────────────────────────────

/**
 * Calculate super tax based on income tiers (higher-income surcharge).
 *
 * Tiers (annual income in PKR):
 *   > 150,000,000 → 1%
 *   > 200,000,000 → 2%
 *   > 250,000,000 → 3%
 *   > 300,000,000 → 4%
 *   > 350,000,000 → 6%
 *   > 400,000,000 → 8%
 *   > 500,000,000 → 10%
 *
 * Companies always pay a minimum of 4% super tax regardless of income.
 *
 * @param income     - Annual income in PKR
 * @param entityType - Optional entity type (companies always pay 4% min)
 * @returns Super tax amount in PKR (rounded)
 */
export function calculateSuperTax(income: number, entityType?: string): number {
  if (income <= 0) return 0

  // Companies always pay minimum 4%
  if (entityType && isCompanyType(entityType as EntityType)) {
    return Math.round(income * 0.04)
  }

  // Tiered super tax for non-company entities
  let rate = 0
  if (income > 500000000) rate = 0.10
  else if (income > 400000000) rate = 0.08
  else if (income > 350000000) rate = 0.06
  else if (income > 300000000) rate = 0.04
  else if (income > 250000000) rate = 0.03
  else if (income > 200000000) rate = 0.02
  else if (income > 150000000) rate = 0.01

  return Math.round(income * rate)
}

// ─── Section 15: Filer / Non-Filer Surcharge ────────────────────────────────

/**
 * Calculate additional surcharge for non-filers.
 *
 * Under ITO 2001 Sections 147-236, non-filers are subject to doubled
 * withholding tax rates on most transaction types. This function computes
 * the additional surcharge (the extra 2% effectively doubling the WHT).
 *
 * @param amount  - Transaction amount in PKR
 * @param isFiler - Whether the taxpayer is on the Active Taxpayer List
 * @returns Additional surcharge amount (0 for filers, ~2% of amount for non-filers)
 */
export function filerNonFilerSurcharge(amount: number, isFiler: boolean): number {
  if (isFiler || amount <= 0) return 0
  // Non-filers pay an additional surcharge of approximately 2%
  // which effectively doubles their withholding tax rates
  return Math.round(amount * 0.02)
}

// ─── Section 16: FBR Return Data Generator (ITR-1) ──────────────────────────

/**
 * Generate ITR-1 compatible JSON return data for FBR filing.
 *
 * Produces a structured JSON object matching the ITR-1 (Individual Return)
 * schema used by FBR IRIS. Includes taxpayer identification, income
 * computation, tax calculation, and deduction schedules.
 *
 * @param result - Tax computation result from `calculateTax()`
 * @param input  - Original tax input extended with identity and filing fields
 * @returns ITR-1 compatible JSON object
 */
export function generateFBRReturnData(
  result: TaxResult,
  input: TaxInput & { ntn?: string; cnic?: string; name?: string; filingType?: string },
): object {
  const now = new Date().toISOString().split('T')[0]

  return {
    returnHeader: {
      formType: 'ITR-1',
      taxYear: input.taxYear || new Date().getFullYear().toString(),
      filingType: input.filingType || 'Original',
      filingDate: now,
      ntn: input.ntn || '',
      cnic: input.cnic || '',
      name: input.name || '',
      entityType: input.entityType || 'Individual',
      isFiler: input.isFiler !== false,
    },
    incomeComputation: {
      incomeHead: result.breakdown.incomeHead,
      grossIncome: result.grossIncome,
      totalDeductions: result.totalDeductions,
      taxableIncome: result.taxableIncome,
    },
    taxComputation: {
      taxComputed: result.taxComputed,
      superTax: result.superTax,
      minimumTax: result.minimumTax,
      totalTaxPayable: result.totalTax,
      effectiveRate: result.effectiveRate,
      taxAfterDeductions: result.taxComputed,
    },
    deductions: result.breakdown.deductions.map((d) => ({
      section: d.section,
      amount: d.amount,
    })),
    slabBreakdown: result.breakdown.slabs.map((s) => ({
      range: s.slab,
      rate: s.rate,
      taxAmount: s.amount,
    })),
    wealthReconciliation: {
      declaredIncome: result.grossIncome,
      taxPaid: result.totalTax,
      netAfterTax: result.grossIncome - result.totalTax,
    },
    declaration: {
      declared: true,
      declarationDate: now,
      verificationStatus: 'Pending',
    },
  }
}

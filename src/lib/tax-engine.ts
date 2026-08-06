// Pakistan Tax Calculation Engine - Based on FBR Income Tax Ordinance 2001
// Tax Year 2024-2025 Rates

export interface SalaryIncome {
  basicSalary: number;
  houseRent: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  bonuses: number;
  otherAllowances: number;
  employerProvidedBenefits: number;
  taxWithheld: number;
}

export interface BusinessIncome {
  grossRevenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  depreciation: number;
  otherDeductions: number;
}

export interface PropertyIncome {
  rentReceived: number;
  propertyTax: number;
  repairs: number;
  insurance: number;
  mortgageInterest: number;
  otherExpenses: number;
}

export interface CapitalGains {
  securitiesGains: number;
  immovablePropertyGains: number;
  holdingPeriodSecurities: number;
  holdingPeriodProperty: number;
}

export interface OtherIncome {
  dividendIncome: number;
  bankProfit: number;
  pensionIncome: number;
  foreignIncome: number;
  other: number;
}

export interface Deductions {
  zakat: number;
  charityApproved: number;
  pensionFund: number;
  lifeInsurance: number;
  educationFee: number;
  healthInsurance: number;
  investmentShares: number;
  houseBuildingLoan: number;
  donationDisasterRelief: number;
  itExportTaxCredit: number;
}

export interface TaxCalculationInput {
  taxYear: string;
  filingType: 'salary' | 'business' | 'aop' | 'company';
  salary?: SalaryIncome;
  business?: BusinessIncome;
  property?: PropertyIncome;
  capitalGains?: CapitalGains;
  otherIncome?: OtherIncome;
  deductions?: Deductions;
  taxAlreadyPaid: number;
  taxpayerAge: number;
  isFemale: boolean;
  isDisability: boolean;
  isGovernmentEmployee: boolean;
}

export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
  fixed: number;
}

// FBR Tax Year 2024-2025 Salary Income Tax Slabs
const SALARY_TAX_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, rate: 0, fixed: 0 },
  { min: 600000, max: 1200000, rate: 0.05, fixed: 0 },
  { min: 1200000, max: 2200000, rate: 0.15, fixed: 60000 },
  { min: 2200000, max: 3200000, rate: 0.25, fixed: 210000 },
  { min: 3200000, max: 4100000, rate: 0.30, fixed: 460000 },
  { min: 4100000, max: 5500000, rate: 0.35, fixed: 730000 },
  { min: 5500000, max: 8000000, rate: 0.40, fixed: 1220000 },
  { min: 8000000, max: 12000000, rate: 0.45, fixed: 2220000 },
  { min: 12000000, max: Infinity, rate: 0.50, fixed: 4020000 },
];

// Business Income Tax Rates (Non-Salaried / AOP)
const BUSINESS_TAX_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, rate: 0, fixed: 0 },
  { min: 600000, max: 1200000, rate: 0.15, fixed: 0 },
  { min: 1200000, max: 1600000, rate: 0.20, fixed: 90000 },
  { min: 1600000, max: 3200000, rate: 0.30, fixed: 170000 },
  { min: 3200000, max: 5600000, rate: 0.40, fixed: 650000 },
  { min: 5600000, max: Infinity, rate: 0.45, fixed: 1610000 },
];

// Company Tax Rates
const COMPANY_TAX_RATES: Record<string, number> = {
  banking: 0.39,
  smallCompany: 0.20,
  normal: 0.29,
  itExport: 0.01,  // IT exports - 1% for first 3 years, then 0.25% (incentive)
  itExportAfter3Years: 0.0025,
  specialTechZone: 0.005,
};

export function calculateSlabTax(income: number, slabs: TaxSlab[]): number {
  if (income <= 0) return 0;

  for (const slab of slabs) {
    if (income > slab.min && income <= slab.max) {
      return (income - slab.min) * slab.rate + slab.fixed;
    }
  }

  // If exceeds all slabs, use the last slab
  const lastSlab = slabs[slabs.length - 1];
  return (income - lastSlab.min) * lastSlab.rate + lastSlab.fixed;
}

export function calculateSalaryTax(input: SalaryIncome): number {
  const totalSalary =
    input.basicSalary +
    input.houseRent +
    input.conveyanceAllowance +
    input.medicalAllowance +
    input.bonuses +
    input.otherAllowances +
    input.employerProvidedBenefits;

  return calculateSlabTax(totalSalary, SALARY_TAX_SLABS);
}

export function calculateBusinessNetIncome(biz: BusinessIncome): number {
  const net = biz.grossRevenue - biz.costOfGoodsSold - biz.operatingExpenses - biz.depreciation - biz.otherDeductions;
  return Math.max(0, net);
}

export function calculatePropertyNetIncome(prop: PropertyIncome): number {
  // Property income: Rent received - 1/5 of rent as repair allowance - actual expenses
  const repairAllowance = prop.rentReceived * 0.2;
  const net = prop.rentReceived - repairAllowance - prop.propertyTax - prop.insurance - prop.mortgageInterest - prop.otherExpenses;
  return Math.max(0, net);
}

export function calculateCapitalGainsTax(gains: CapitalGains): { securitiesTax: number; propertyTax: number; totalTax: number } {
  // Securities: Holding period determines tax rate
  let securitiesRate: number;
  if (gains.holdingPeriodSecurities <= 365) {
    securitiesRate = 0.15;
  } else {
    securitiesRate = 0.125; // 12.5% for > 1 year
  }

  // Immoveable Property: Holding period determines rate
  let propertyRate: number;
  if (gains.holdingPeriodProperty <= 365) {
    propertyRate = 0.15;
  } else {
    propertyRate = 0.125;
  }

  const securitiesTax = Math.max(0, gains.securitiesGains) * securitiesRate;
  const propertyTax = Math.max(0, gains.immovablePropertyGains) * propertyRate;

  return {
    securitiesTax,
    propertyTax,
    totalTax: securitiesTax + propertyTax,
  };
}

export function calculateDeductions(deductions: Deductions, grossIncome: number, filingType: string): {
  totalDeductions: number;
  breakdown: Record<string, { claimed: number; maxAllowed: number; section: string }>;
} {
  const breakdown: Record<string, { claimed: number; maxAllowed: number; section: string }> = {};
  let total = 0;

  // Section 60 - Zakat
  const zakatMax = grossIncome;
  const zakatClaimed = Math.min(deductions.zakat, zakatMax);
  breakdown['zakat'] = { claimed: zakatClaimed, maxAllowed: zakatMax, section: 'Sec 60' };
  total += zakatClaimed;

  // Section 61 - Approved Charitable Institutions (max 30% of income)
  const charityMax = grossIncome * 0.30;
  const charityClaimed = Math.min(deductions.charityApproved, charityMax);
  breakdown['charity'] = { claimed: charityClaimed, maxAllowed: charityMax, section: 'Sec 61' };
  total += charityClaimed;

  // Section 63 - Approved Pension Fund (max 20% of income)
  const pensionMax = grossIncome * 0.20;
  const pensionClaimed = Math.min(deductions.pensionFund, pensionMax);
  breakdown['pension'] = { claimed: pensionClaimed, maxAllowed: pensionMax, section: 'Sec 63' };
  total += pensionClaimed;

  // Section 64 - Life Insurance Premium (max 20% of income)
  const insuranceMax = grossIncome * 0.20;
  const insuranceClaimed = Math.min(deductions.lifeInsurance, insuranceMax);
  breakdown['insurance'] = { claimed: insuranceClaimed, maxAllowed: insuranceMax, section: 'Sec 64' };
  total += insuranceClaimed;

  // Section 65A - Education Fee (max 5% of income)
  const eduMax = grossIncome * 0.05;
  const eduClaimed = Math.min(deductions.educationFee, eduMax);
  breakdown['education'] = { claimed: eduClaimed, maxAllowed: eduMax, section: 'Sec 65A' };
  total += eduClaimed;

  // Section 65B - Health Insurance (max 5% of income)
  const healthMax = grossIncome * 0.05;
  const healthClaimed = Math.min(deductions.healthInsurance, healthMax);
  breakdown['health'] = { claimed: healthClaimed, maxAllowed: healthMax, section: 'Sec 65B' };
  total += healthClaimed;

  // Section 62A - Investment in Shares (max 20% of taxable income or PKR 2M)
  const shareMax = Math.min(grossIncome * 0.20, 2000000);
  const shareClaimed = Math.min(deductions.investmentShares, shareMax);
  breakdown['shares'] = { claimed: shareClaimed, maxAllowed: shareMax, section: 'Sec 62A' };
  total += shareClaimed;

  // Section 65 - House Building Loan Interest
  const houseMax = grossIncome * 0.25;
  const houseClaimed = Math.min(deductions.houseBuildingLoan, houseMax);
  breakdown['houseLoan'] = { claimed: houseClaimed, maxAllowed: houseMax, section: 'Sec 65' };
  total += houseClaimed;

  // Disaster Relief Donations (100% of donated amount)
  const disasterClaimed = Math.min(deductions.donationDisasterRelief, grossIncome);
  breakdown['disaster'] = { claimed: disasterClaimed, maxAllowed: grossIncome, section: 'Sec 61(3A)' };
  total += disasterClaimed;

  // IT Export Tax Credit
  const itMax = grossIncome * 0.01; // 1% of income
  const itClaimed = Math.min(deductions.itExportTaxCredit, itMax);
  breakdown['itExport'] = { claimed: itClaimed, maxAllowed: itMax, section: 'Sec 65E' };
  total += itClaimed;

  return { totalDeductions: total, breakdown };
}

export function calculateWithholdingTax(type: string, amount: number): {
  rate: number;
  tax: number;
  section: string;
} {
  const rates: Record<string, { rate: number; section: string }> = {
    bankProfit: { rate: 0.15, section: 'Sec 151' },
    dividend: { rate: 0.15, section: 'Sec 150' },
    salary: { rate: 0, section: 'Sec 149' }, // Varies by slab
    services: { rate: 0.15, section: 'Sec 153' },
    goods: { rate: 0.04, section: 'Sec 153' },
    contract: { rate: 0.07, section: 'Sec 155' },
    propertyRent: { rate: 0.15, section: 'Sec 155' },
    exports: { rate: 0.01, section: 'Sec 154' },
    imports: { rate: 0.055, section: 'Sec 148' },
    telephone: { rate: 0.14, section: 'Sec 153' },
    electricity: { rate: 0.10, section: 'Sec 235' },
  prizeWinnings: { rate: 0.15, section: 'Sec 156' },
  livestock: { rate: 0.025, section: 'Sec 152A' },
  propertyPurchase: { rate: 0.03, section: 'Sec 236K' },
    propertySale: { rate: 0.03, section: 'Sec 236C' },
    vehiclePurchase: { rate: 0.03, section: 'Sec 231' },
    bankingTransaction: { rate: 0.01, section: 'Sec 231A' },
  stockExchange: { rate: 0.005, section: 'Sec 233' },
  natExemption: { rate: 0.015, section: 'Sec 236AB' },
  electricityBillDomestic: { rate: 0.075, section: 'Sec 235' },
  electricityBillIndustrial: { rate: 0.17, section: 'Sec 235' },
  marriageHall: { rate: 0.10, section: 'Sec 236AH' },
  professionalFee: { rate: 0.10, section: 'Sec 236P' },
  cableInternet: { rate: 0.10, section: 'Sec 236U' },
  educationFeePrivate: { rate: 0.05, section: 'Sec 236I' },
  courierServices: { rate: 0.05, section: 'Sec 236T' },
  airfare: { rate: 0.04, section: 'Sec 236W' },
  foreignRemittance: { rate: 0.01, section: 'Sec 236Y' },
  insurancePremium: { rate: 0.05, section: 'Sec 236AA' },
  auctionPurchase: { rate: 0.10, section: 'Sec 236E' },
  dealerIndustrial: { rate: 0.05, section: 'Sec 231A' },
  advanceTaxOnSaleImmovable: { rate: 0.03, section: 'Sec 236C' },
  filerNonfilerAdjustment: { rate: 0, section: 'Various' },
  };

  const config = rates[type] || { rate: 0, section: 'N/A' };
  return {
    rate: config.rate,
    tax: amount * config.rate,
    section: config.section,
  };
}

export function calculateSuperTax(income: number): {
  rate: number;
  tax: number;
  threshold: number;
} {
  // Super Tax for tax year 2024-2025
  if (income <= 150000000) {
    return { rate: 0, tax: 0, threshold: 150000000 };
  } else if (income <= 200000000) {
    return { rate: 0.01, tax: (income - 150000000) * 0.01, threshold: 150000000 };
  } else if (income <= 250000000) {
    return { rate: 0.02, tax: 50000000 * 0.01 + (income - 200000000) * 0.02, threshold: 150000000 };
  } else if (income <= 300000000) {
    return { rate: 0.03, tax: 50000000 * 0.01 + 50000000 * 0.02 + (income - 250000000) * 0.03, threshold: 150000000 };
  } else if (income <= 350000000) {
    return { rate: 0.06, tax: 50000000 * 0.01 + 50000000 * 0.02 + 50000000 * 0.03 + (income - 300000000) * 0.06, threshold: 150000000 };
  } else if (income <= 400000000) {
    return { rate: 0.08, tax: 50000000 * 0.01 + 50000000 * 0.02 + 50000000 * 0.03 + 50000000 * 0.06 + (income - 350000000) * 0.08, threshold: 150000000 };
  } else if (income <= 500000000) {
    return { rate: 0.10, tax: 50000000 * 0.01 + 50000000 * 0.02 + 50000000 * 0.03 + 50000000 * 0.06 + 50000000 * 0.08 + (income - 400000000) * 0.10, threshold: 150000000 };
  } else {
    return { rate: 0.10, tax: 50000000 * (0.01 + 0.02 + 0.03 + 0.06 + 0.08) + (income - 400000000) * 0.10, threshold: 150000000 };
  }
}

export function filerNonFilerSurcharge(income: number, isFiler: boolean): number {
  if (isFiler) return 0;
  // Non-filers pay higher withholding tax rates
  return income * 0.02; // 2% additional tax for non-filers
}

export interface FullTaxResult {
 taxYear: string;
 filingType: string;

  // Income breakdown
  salaryIncome: number;
  businessIncome: number;
  propertyIncome: number;
  capitalGainsIncome: number;
  otherSourcesIncome: number;
  grossIncome: number;

  // Deductions
  totalDeductions: number;
  deductionsBreakdown: Record<string, { claimed: number; maxAllowed: number; section: string }>;

  // Tax
  taxableIncome: number;
  normalTax: number;
  capitalGainsTax: number;
  superTax: number;
  minimumTax: number;

  // Credits & Payments
  taxCreditsApplied: number;
  taxAlreadyPaid: number;
  taxPayable: number;
  taxDue: number;
  taxRefund: number;

  // Effective Rate
  effectiveRate: number;

  // Calculation steps for transparency
  calculationSteps: string[];
}

export function calculateFullTax(input: TaxCalculationInput): FullTaxResult {
  const steps: string[] = [];

  // 1. Calculate each income head
  let salaryIncome = 0;
  let businessIncome = 0;
  let propertyIncome = 0;
  let capitalGainsIncome = 0;
  let otherSourcesIncome = 0;

  if (input.salary) {
    salaryIncome =
      input.salary.basicSalary +
      input.salary.houseRent +
      input.salary.conveyanceAllowance +
      input.salary.medicalAllowance +
      input.salary.bonuses +
      input.salary.otherAllowances +
      input.salary.employerProvidedBenefits;
    steps.push(`Salary Income: PKR ${salaryIncome.toLocaleString()}`);
  }

  if (input.business) {
    businessIncome = calculateBusinessNetIncome(input.business);
    steps.push(`Business Income (Net): PKR ${businessIncome.toLocaleString()}`);
  }

  if (input.property) {
    propertyIncome = calculatePropertyNetIncome(input.property);
    steps.push(`Property Income (Net): PKR ${propertyIncome.toLocaleString()}`);
  }

  let capitalGainsTax = 0;
  if (input.capitalGains) {
    capitalGainsIncome = Math.max(0, input.capitalGains.securitiesGains) + Math.max(0, input.capitalGains.immovablePropertyGains);
    const cgResult = calculateCapitalGainsTax(input.capitalGains);
    capitalGainsTax = cgResult.totalTax;
    steps.push(`Capital Gains: Securities PKR ${input.capitalGains.securitiesGains.toLocaleString()}, Property PKR ${input.capitalGains.immovablePropertyGains.toLocaleString()}`);
    steps.push(`Capital Gains Tax: PKR ${capitalGainsTax.toLocaleString()}`);
  }

  if (input.otherIncome) {
    otherSourcesIncome =
      input.otherIncome.dividendIncome +
      input.otherIncome.bankProfit +
      input.otherIncome.pensionIncome +
      input.otherIncome.foreignIncome +
      input.otherIncome.other;
    steps.push(`Other Income: PKR ${otherSourcesIncome.toLocaleString()}`);
  }

  const grossIncome = salaryIncome + businessIncome + propertyIncome + capitalGainsIncome + otherSourcesIncome;
  steps.push(`Gross Total Income: PKR ${grossIncome.toLocaleString()}`);

  // 2. Calculate Deductions
  let totalDeductions = 0;
  let deductionsBreakdown: Record<string, { claimed: number; maxAllowed: number; section: string }> = {};

  if (input.deductions && grossIncome > 0) {
    const dedResult = calculateDeductions(input.deductions, grossIncome, input.filingType);
    totalDeductions = dedResult.totalDeductions;
    deductionsBreakdown = dedResult.breakdown;
    steps.push(`Total Deductions: PKR ${totalDeductions.toLocaleString()}`);
    for (const [key, val] of Object.entries(deductionsBreakdown)) {
      if (val.claimed > 0) {
        steps.push(`  ${key} (${val.section}): PKR ${val.claimed.toLocaleString()} (max: PKR ${val.maxAllowed.toLocaleString()})`);
      }
    }
  }

  // 3. Taxable Income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  steps.push(`Taxable Income: PKR ${taxableIncome.toLocaleString()}`);

  // 4. Calculate Normal Tax
  let normalTax = 0;
  if (input.filingType === 'salary' || input.filingType === 'company') {
    if (input.salary) {
      normalTax = calculateSalaryTax(input.salary);
    } else {
      normalTax = calculateSlabTax(taxableIncome, SALARY_TAX_SLABS);
    }
  } else {
    normalTax = calculateSlabTax(taxableIncome, BUSINESS_TAX_SLABS);
  }
  steps.push(`Normal Tax (on slab): PKR ${normalTax.toLocaleString()}`);

  // 5. Super Tax
  const superTaxResult = calculateSuperTax(grossIncome);
  steps.push(`Super Tax: PKR ${superTaxResult.tax.toLocaleString()}`);

  // 6. Minimum Tax (1% of gross for companies)
  const minimumTax = input.filingType === 'company' ? grossIncome * 0.01 : 0;
  steps.push(`Minimum Tax: PKR ${minimumTax.toLocaleString()}`);

  // 7. Total Tax
  const totalTax = normalTax + capitalGainsTax + superTaxResult.tax;
  const finalTax = Math.max(totalTax, minimumTax);

  // 8. Tax Credits
  let taxCredits = 0;
  if (input.deductions) {
    taxCredits = input.deductions.itExportTaxCredit;
  }

  // 9. Tax Payable
  const taxPayable = Math.max(0, finalTax - taxCredits);
  const taxDue = Math.max(0, taxPayable - input.taxAlreadyPaid);
  const taxRefund = input.taxAlreadyPaid > taxPayable ? input.taxAlreadyPaid - taxPayable : 0;

  const effectiveRate = grossIncome > 0 ? (taxPayable / grossIncome) * 100 : 0;

  steps.push(`Tax Payable: PKR ${taxPayable.toLocaleString()}`);
  steps.push(`Tax Already Paid/Withheld: PKR ${input.taxAlreadyPaid.toLocaleString()}`);
  steps.push(`Tax Due: PKR ${taxDue.toLocaleString()}`);
  if (taxRefund > 0) {
    steps.push(`Tax Refund: PKR ${taxRefund.toLocaleString()}`);
  }
  steps.push(`Effective Tax Rate: ${effectiveRate.toFixed(2)}%`);

  return {
    taxYear: input.taxYear,
    filingType: input.filingType,
    salaryIncome,
    businessIncome,
    propertyIncome,
    capitalGainsIncome,
    otherSourcesIncome,
    grossIncome,
    totalDeductions,
    deductionsBreakdown,
    taxableIncome,
    normalTax,
    capitalGainsTax,
    superTax: superTaxResult.tax,
    minimumTax,
    taxCreditsApplied: taxCredits,
    taxAlreadyPaid: input.taxAlreadyPaid,
    taxPayable,
    taxDue,
    taxRefund,
    effectiveRate,
    calculationSteps: steps,
  };
}

// Get applicable tax slab details for display
export function getTaxSlabs(filingType: string): TaxSlab[] {
  if (filingType === 'salary') return SALARY_TAX_SLABS;
  return BUSINESS_TAX_SLABS;
}

// Generate FBR-compatible return data
export function generateFBRReturnData(result: FullTaxResult): string {
  const fbrData = {
    returnForm: 'ITR-1',
    taxYear: result.taxYear,
    filingType: result.filingType,
    grossIncome: result.grossIncome,
    totalDeductions: result.totalDeductions,
    taxableIncome: result.taxableIncome,
    taxComputed: result.taxPayable + result.taxCreditsApplied,
    taxCredits: result.taxCreditsApplied,
    taxPayable: result.taxPayable,
    taxAlreadyPaid: result.taxAlreadyPaid,
    taxDue: result.taxDue,
    declaration: {
      declaredCorrect: true,
      declarationDate: new Date().toISOString().split('T')[0],
    },
    // Schedules
    schedules: {
      salary: result.salaryIncome,
      business: result.businessIncome,
      property: result.propertyIncome,
      capitalGains: result.capitalGainsIncome,
      otherSources: result.otherSourcesIncome,
    },
  };

  return JSON.stringify(fbrData, null, 2);
}

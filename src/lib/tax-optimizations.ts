// Pakistan Tax Optimization Strategies - LEGAL Tax Minimization
// Based on Income Tax Ordinance 2001, Finance Act 2024

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  section: string;
  applicableTo: string[]; // salary, business, aop, company
  maxBenefit: string;
  complexity: 'low' | 'medium' | 'high';
 requirements: string[];
  calculation: string;
  risk: 'none' | 'low' | 'medium';
 example: string;
}

export const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'sec62a-share-investment',
    name: 'Investment in Listed Securities (Section 62A)',
    description: 'Invest in newly issued shares of companies listed on Pakistan Stock Exchange to claim a tax credit. This incentive encourages investment in the capital market and is one of the most generous deductions available. The credit reduces your tax liability directly, making it more valuable than a deduction.',
    section: 'Section 62A, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '20% of taxable income or PKR 2,000,000 whichever is lower',
    complexity: 'medium',
    requirements: [
      'Invest in newly issued shares (IPO or right shares)',
      'Shares must be of companies listed on PSX',
      'Hold investment for at least 2 years',
      'Investment must be made in the tax year',
      'National Tax Number (NTN) must be on the CDC account',
    ],
    calculation: 'Credit = Lower of (20% × Taxable Income) OR (PKR 2,000,000). If taxable income = PKR 5,000,000, credit = PKR 1,000,000.',
    risk: 'low',
    example: 'If your taxable income is PKR 8,000,000, invest PKR 1,600,000 (20%) in listed shares. This directly reduces your tax liability by PKR 1,600,000.',
  },
  {
    id: 'sec63-pension-fund',
    name: 'Approved Pension Fund Contribution (Section 63)',
    description: 'Contributions to Voluntary Pension Funds (VPF) approved by the Securities and Exchange Commission of Pakistan (SECP) qualify for a tax deduction. This is an excellent long-term tax planning strategy that also builds retirement savings. The fund must be managed by an approved asset management company.',
    section: 'Section 63, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '20% of taxable income',
    complexity: 'low',
    requirements: [
      'Contribute to SECP-approved pension fund',
      'Maximum 20% of taxable income',
      'Fund must be registered with SECP',
      'Minimum lock-in period of 5 years applies',
    ],
    calculation: 'Deduction = Lower of (20% × Taxable Income) OR (Actual Contribution). This reduces taxable income, not tax directly.',
    risk: 'none',
    example: 'If taxable income is PKR 5,000,000, contribute PKR 1,000,000 to an approved pension fund. Taxable income reduces to PKR 4,000,000, saving approximately PKR 250,000 in tax.',
  },
  {
    id: 'sec64-life-insurance',
    name: 'Life Insurance Premium (Section 64)',
    description: 'Premiums paid on life insurance policies from approved insurance companies in Pakistan are deductible from taxable income. This strategy provides dual benefit of tax savings and life coverage. The policy must be for a minimum term and the insurance company must be registered with SECP.',
    section: 'Section 64, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '20% of taxable income',
    complexity: 'low',
    requirements: [
      'Policy from SECP-approved insurance company',
      'Premium paid in the tax year',
      'Maximum 20% of taxable income',
      'Life insurance policy (not general/health)',
    ],
    calculation: 'Deduction = Lower of (20% × Taxable Income) OR (Actual Premium Paid).',
    risk: 'none',
    example: 'Annual premium of PKR 500,000 on a life insurance policy. If taxable income is PKR 4,000,000, full PKR 500,000 is deductible (within 20% limit of PKR 800,000).',
  },
  {
    id: 'sec61-charity',
    name: 'Donation to Approved Charitable Institutions (Section 61)',
    description: 'Donations to institutions approved under clause (c) of sub-section (2) of Section 61 are deductible. For donations to Pakistan-based institutions, the deduction is up to 30% of taxable income. Donations for disaster relief (declared by the Federal Government) are 100% deductible.',
    section: 'Section 61, ITO 2001',
    applicableTo: ['salary', 'business', 'aop', 'company'],
    maxBenefit: '30% of taxable income (normal), 100% for disaster relief',
    complexity: 'low',
    requirements: [
      'Donation to FBR-approved charitable institution',
      'Receipt/certificate from the institution',
      'Normal charity: max 30% of taxable income',
      'Disaster relief: 100% deductible (no limit)',
    ],
    calculation: 'Normal: Deduction = Lower of (30% × Taxable Income) OR (Actual Donation). Disaster: Full amount deductible.',
    risk: 'low',
    example: 'Donate PKR 1,500,000 to Shaukat Khanum Memorial Trust. If taxable income is PKR 5,000,000, maximum deduction is PKR 1,500,000 (30% of 5M = 1.5M). Tax saving: approximately PKR 375,000.',
  },
  {
    id: 'sec65a-education',
    name: 'Education Fee Deduction (Section 65A)',
    description: 'Tuition fees paid for children\'s education at recognized educational institutions in Pakistan qualify for a tax deduction. This is particularly valuable for salaried individuals with school or university-going children. The institution must be recognized by the relevant education board or university.',
    section: 'Section 65A, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '5% of taxable income per year',
    complexity: 'low',
    requirements: [
      'Fees paid to HEC/Board-recognized institution',
      'Maximum 5% of taxable income',
      'Children\'s education only (not self)',
      'Receipt required from the institution',
    ],
    calculation: 'Deduction = Lower of (5% × Taxable Income) OR (Actual Tuition Fee Paid).',
    risk: 'none',
    example: 'Tuition fees of PKR 200,000 for two children. If taxable income is PKR 5,000,000, max deduction is PKR 250,000 (5% of 5M). Full PKR 200,000 is deductible.',
  },
  {
    id: 'sec65b-health-insurance',
    name: 'Health Insurance Premium (Section 65B)',
    description: 'Premium paid for health insurance covering self, spouse, and dependent children is deductible. This provision encourages citizens to obtain health coverage while reducing their tax burden. The policy must be from an insurance company registered in Pakistan.',
    section: 'Section 65B, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '5% of taxable income',
    complexity: 'low',
    requirements: [
      'Health insurance from registered Pakistani insurance company',
      'Covers self, spouse, and/or dependent children',
      'Maximum 5% of taxable income',
      'Premium paid in the tax year',
    ],
    calculation: 'Deduction = Lower of (5% × Taxable Income) OR (Actual Premium Paid).',
    risk: 'none',
    example: 'Health insurance premium of PKR 100,000. If taxable income is PKR 3,000,000, max deduction is PKR 150,000 (5% of 3M). Full PKR 100,000 is deductible.',
  },
  {
    id: 'sec65-house-loan',
    name: 'House Building Loan Interest (Section 65)',
    description: 'Interest paid on a loan taken for construction or purchase of a house is deductible. The house must be for own residence and the loan must be from a scheduled bank or financial institution. This is one of the most significant deductions for homeowners with mortgages.',
    section: 'Section 65, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '25% of taxable income',
    complexity: 'medium',
    requirements: [
      'Loan from scheduled bank/HDFC/financial institution',
      'House for own residence only',
      'Maximum 25% of taxable income',
      'Only interest component is deductible (not principal)',
    ],
    calculation: 'Deduction = Lower of (25% × Taxable Income) OR (Actual Interest Paid).',
    risk: 'low',
    example: 'Annual mortgage interest of PKR 1,200,000. If taxable income is PKR 6,000,000, max deduction is PKR 1,500,000 (25% of 6M). Full interest is deductible, saving approximately PKR 300,000 in tax.',
  },
  {
    id: 'it-export-1pct',
    name: 'IT & IT-Enabled Services Export Tax Credit (Section 65E)',
    description: 'Companies exporting IT and IT-enabled services from Pakistan enjoy an extremely low tax rate of 1% for the first three years and 0.25% thereafter. This is Pakistan\'s most aggressive tax incentive for the tech sector, designed to boost IT exports and attract foreign IT companies to establish operations in Pakistan.',
    section: 'Section 65E / SRO 575(I)/2023',
    applicableTo: ['company'],
    maxBenefit: 'Up to 99% tax reduction on export income',
    complexity: 'medium',
    requirements: [
      'IT or ITeS company registered with PSEB',
      'Minimum 70% of revenue from exports',
      'Maintain separate accounts for export income',
      'Register with Pakistan Software Export Board',
      'First 3 years: 1% tax rate',
      'After 3 years: 0.25% tax rate',
    ],
    calculation: 'Years 1-3: Tax = 1% × Export Revenue. After 3 years: Tax = 0.25% × Export Revenue. Normal rate would be 29%.',
    risk: 'low',
    example: 'IT company with PKR 50,000,000 export revenue. Normal tax: PKR 14,500,000 (29%). With incentive: PKR 500,000 (1%). Savings: PKR 14,000,000 per year.',
  },
  {
    id: 'sec111-4-foreign-remittance',
    name: 'Foreign Income Remitted to Pakistan (Section 111(4))',
    description: 'Income earned abroad and remitted to Pakistan through proper banking channels is exempt from Pakistani tax. This applies to Pakistan-origin income and certain categories of foreign income. The remittance must be made through official banking channels and properly declared.',
    section: 'Section 111(4), ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '100% exemption on remitted foreign income',
    complexity: 'low',
    requirements: [
      'Income must be earned abroad',
      'Remitted through proper banking channels',
      'Foreign currency converted through authorized dealer',
      'Proper declaration in tax return',
    ],
    calculation: 'Tax = 0 on properly remitted foreign income. Full exemption.',
    risk: 'low',
    example: 'A Pakistani freelancer earning PKR 5,000,000 from overseas clients. If remitted through official channels, this income is exempt from Pakistani income tax.',
  },
  {
    id: 'special-tech-zone',
    name: 'Special Technology Zone Incentives (STZA)',
    description: 'Companies operating in Special Technology Zones established under the STZA Act 2021 enjoy 0.5% tax rate for 10 years, along with customs duty exemptions and other benefits. This is part of Pakistan\'s push to create technology hubs comparable to those in other developing nations.',
    section: 'STZA Act 2021 / SRO 984(I)/2021',
    applicableTo: ['company'],
    maxBenefit: '0.5% tax rate for 10 years',
    complexity: 'high',
    requirements: [
      'Company must be in an approved Special Technology Zone',
      'Must be a tech/startup company',
      'Register with STZA Authority',
      'Minimum 80% revenue from technology-related activities',
      'Compliance with STZA reporting requirements',
    ],
    calculation: 'Tax = 0.5% × Total Revenue (for 10 years from establishment).',
    risk: 'medium',
    example: 'Tech startup in STZA with PKR 100,000,000 revenue. Normal tax: PKR 29,000,000 (29%). STZA rate: PKR 500,000 (0.5%). Savings: PKR 28,500,000 per year for 10 years.',
  },
  {
    id: 'sec100a-alternative-dispute',
    name: 'Alternative Dispute Resolution (ADR) for Tax Disputes',
    description: 'Use the ADR mechanism to resolve tax disputes without going through lengthy litigation. FBR offers an online dispute resolution system that can reduce penalties and additional taxes. This is not a tax planning strategy per se, but it\'s crucial for minimizing tax-related costs during audits.',
    section: 'Section 100A-100D, ITO 2001',
    applicableTo: ['salary', 'business', 'aop', 'company'],
    maxBenefit: 'Reduction of penalties up to 50%',
    complexity: 'medium',
    requirements: [
      'Tax assessment must be pending or disputed',
      'Apply through FBR\'s IRIS portal',
      'Willingness to negotiate with FBR',
      'Documentation to support your position',
    ],
    calculation: 'Savings depend on the dispute. Typically 30-50% reduction in disputed amount through mutual agreement.',
    risk: 'low',
    example: 'FBR raises an additional tax demand of PKR 2,000,000. Through ADR, the matter is resolved for PKR 1,000,000, saving PKR 1,000,000 plus legal fees.',
  },
  {
    id: 'split-income-family',
    name: 'Income Splitting Through Family Business Structure',
    description: 'Structure business operations to distribute income among family members who are in lower tax brackets. Each family member with an active NTN can file independently, and the progressive tax slab system means the combined family tax is lower when income is distributed among multiple returns. This must be a genuine business arrangement.',
    section: 'Section 63 / General Principles',
    applicableTo: ['business', 'aop'],
    maxBenefit: '15-25% tax reduction through bracket optimization',
    complexity: 'high',
    requirements: [
      'Genuine business involvement of each family member',
      'Each member must have active NTN registration',
      'Proper documentation of each person\'s contribution',
      'Cannot be sham/arrangement only for tax saving',
      'Each member must file individual tax returns',
    ],
    calculation: 'Example: One person earning PKR 6,000,000 pays PKR 460,000 tax. Split among 3 people at PKR 2,000,000 each, total tax = 3 × PKR 20,000 = PKR 60,000. Savings: PKR 400,000.',
    risk: 'medium',
    example: 'A family business with PKR 9,000,000 profit. Single return tax: PKR 1,440,000. Split among 3 active partners at PKR 3,000,000 each: 3 × PKR 60,000 = PKR 180,000. Total savings: PKR 1,260,000.',
  },
  {
    id: 'depreciation-accelerated',
    name: 'Accelerated Depreciation on New Machinery (Section 23)',
    description: 'New plant and machinery installed for manufacturing or production can qualify for accelerated depreciation rates. Instead of the standard 10-15% annual depreciation, certain categories allow 50% in the first year. This significantly reduces taxable business income in the initial years of capital investment.',
    section: 'Third Schedule, ITO 2001',
    applicableTo: ['business', 'company'],
    maxBenefit: 'Up to 50% first-year depreciation',
    complexity: 'medium',
    requirements: [
      'New plant and machinery (not second-hand)',
      'Used in manufacturing or production',
      'Installed in the tax year',
      'Proper asset register maintained',
    ],
    calculation: 'Normal Depreciation: 10-15% per year. Accelerated: Up to 50% in Year 1. For PKR 10M machinery: Normal = PKR 1.5M deduction. Accelerated = PKR 5M deduction. Extra saving: PKR 875,000 in Year 1 tax.',
    risk: 'low',
    example: 'Business purchases PKR 20,000,000 in new machinery. Standard 15% depreciation = PKR 3,000,000 deduction. Accelerated 50% = PKR 10,000,000 deduction. Additional Year 1 tax saving: PKR 1,750,000.',
  },
  {
    id: 'sec113-property-repair',
    name: 'Property Income Repair Allowance Optimization',
    description: 'Property income allows a standard 1/5th (20%) deduction as repair allowance regardless of actual repair expenses. Additionally, actual expenses like property tax, insurance, and mortgage interest are separately deductible. Maximizing documentation of all property-related expenses can significantly reduce taxable rental income.',
    section: 'Section 15A, ITO 2001',
    applicableTo: ['salary', 'business', 'aop'],
    maxBenefit: '20% standard + actual expenses deduction',
    complexity: 'low',
    requirements: [
      'Rental property in Pakistan',
      'Proper rent agreements',
      'Receipts for property tax, insurance, repairs',
      'Mortgage interest certificate from bank',
    ],
    calculation: 'Net Property Income = Rent - (20% Rent as repair) - Property Tax - Insurance - Mortgage Interest - Other Expenses.',
    risk: 'none',
    example: 'Rent PKR 1,200,000/year. Repair allowance (20%): PKR 240,000. Property tax: PKR 60,000. Insurance: PKR 30,000. Mortgage interest: PKR 480,000. Net taxable: PKR 390,000 (vs PKR 1,200,000 gross). Tax saving: approximately PKR 150,000.',
  },
  {
    id: 'withholding-optimize',
    name: 'Withholding Tax Optimization & Filer Benefits',
    description: 'Active tax filers enjoy significantly lower withholding tax rates across all categories. Being an active filer on FBR\'s ATL (Active Taxpayers List) means lower WHT on banking transactions, property transactions, vehicle purchases, and more. This is the single most impactful "optimization" for most taxpayers.',
    section: 'Various - Sec 147-236 series',
    applicableTo: ['salary', 'business', 'aop', 'company'],
    maxBenefit: '50-100% reduction in withholding tax rates',
    complexity: 'low',
    requirements: [
      'File annual tax return on time',
      'Ensure name appears on ATL',
      'Keep NTN active and updated',
      'File even if income is below threshold',
    ],
    calculation: 'Non-filer bank transaction WHT: 0.6% vs Filer: 0.3%. Property purchase: Non-filer 6% vs Filer 3%. Vehicle: Non-filer 6% vs Filer 3%. Annual savings can be substantial.',
    risk: 'none',
    example: 'A business with PKR 50,000,000 in banking transactions annually. Non-filer WHT: PKR 300,000 (0.6%). Filer WHT: PKR 150,000 (0.3%). Plus lower rates on property, vehicles, contracts. Total annual WHT savings: easily PKR 500,000+.',
  },
];

export interface OptimizationResult {
  applicableStrategies: OptimizationStrategy[];
  estimatedSavings: number;
  originalTax: number;
  optimizedTax: number;
  recommendations: string[];
  priorityActions: string[];
}

export function analyzeOptimizations(
  taxableIncome: number,
  filingType: string,
  currentDeductions: { [key: string]: number },
  grossIncome: number
): OptimizationResult {
  const applicable = OPTIMIZATION_STRATEGIES.filter(s =>
    s.applicableTo.includes(filingType)
  );

  let estimatedSavings = 0;
  let optimizedTax = 0;
  const recommendations: string[] = [];
  const priorityActions: string[] = [];

  // Calculate potential savings from each strategy
  for (const strategy of applicable) {
    let potentialSaving = 0;

    switch (strategy.id) {
      case 'sec62a-share-investment': {
        const maxCredit = Math.min(taxableIncome * 0.20, 2000000);
        potentialSaving = maxCredit * 0.30; // Approximate tax saving
        if (!currentDeductions.investmentShares || currentDeductions.investmentShares < maxCredit) {
          recommendations.push(`Invest PKR ${maxCredit.toLocaleString()} in listed shares via Section 62A for a tax credit of up to PKR ${maxCredit.toLocaleString()}`);
          priorityActions.push('Open a CDC account and invest in IPO/right shares of PSX-listed companies');
        }
        break;
      }
      case 'sec63-pension-fund': {
        const maxPension = taxableIncome * 0.20;
        const currentPension = currentDeductions.pensionFund || 0;
        const available = maxPension - currentPension;
        if (available > 0) {
          potentialSaving = available * 0.25; // Approximate
          recommendations.push(`Increase pension fund contribution by PKR ${available.toLocaleString()} (up to 20% limit) to save approximately PKR ${potentialSaving.toLocaleString()} in tax`);
        }
        break;
      }
      case 'sec64-life-insurance': {
        const maxIns = taxableIncome * 0.20;
        const currentIns = currentDeductions.lifeInsurance || 0;
        const available = maxIns - currentIns;
        if (available > 0) {
          potentialSaving = available * 0.25;
          recommendations.push(`Consider life insurance premium of PKR ${Math.min(available, 500000).toLocaleString()} for additional tax deduction`);
        }
        break;
      }
      case 'sec61-charity': {
        const maxCharity = grossIncome * 0.30;
        const currentCharity = currentDeductions.charityApproved || 0;
        const available = maxCharity - currentCharity;
        if (available > 0) {
          potentialSaving = available * 0.25;
          recommendations.push(`Strategic charitable giving of PKR ${Math.min(available, 1000000).toLocaleString()} to approved institutions can reduce tax by approximately PKR ${Math.min(available, 1000000) * 0.25}.toLocaleString()`);
          priorityActions.push('Identify FBR-approved charitable institutions for year-end tax planning donations');
        }
        break;
      }
      case 'sec65-house-loan': {
        if (!currentDeductions.houseBuildingLoan || currentDeductions.houseBuildingLoan === 0) {
          potentialSaving = 300000; // Estimated average
          recommendations.push('If you have a mortgage, ensure you are claiming the interest deduction under Section 65 (up to 25% of taxable income)');
        }
        break;
      }
      case 'sec65a-education': {
        const maxEdu = grossIncome * 0.05;
        const currentEdu = currentDeductions.educationFee || 0;
        if (currentEdu < maxEdu) {
          potentialSaving = (maxEdu - currentEdu) * 0.25;
          recommendations.push(`Claim education fee deduction for children (up to 5% of income = PKR ${maxEdu.toLocaleString()})`);
        }
        break;
      }
      case 'sec65b-health-insurance': {
        const maxHealth = grossIncome * 0.05;
        const currentHealth = currentDeductions.healthInsurance || 0;
        if (currentHealth < maxHealth) {
          potentialSaving = (maxHealth - currentHealth) * 0.25;
          recommendations.push(`Get health insurance to claim deduction (up to 5% = PKR ${maxHealth.toLocaleString()})`);
        }
        break;
      }
      case 'withholding-optimize': {
        potentialSaving = 500000; // Conservative estimate for active filer
        recommendations.push('Ensure timely filing to remain on Active Taxpayers List (ATL) for lower withholding tax rates across all transactions');
        priorityActions.push('File tax return before due date and verify ATL status');
        break;
      }
      case 'depreciation-accelerated': {
        if (filingType === 'business' || filingType === 'company') {
          potentialSaving = 500000;
          recommendations.push('If purchasing new machinery, opt for accelerated depreciation (50% first year) instead of standard 10-15%');
        }
        break;
      }
    }

    estimatedSavings += potentialSaving;
  }

  return {
    applicableStrategies: applicable,
    estimatedSavings: Math.round(estimatedSavings),
    originalTax: taxableIncome * 0.25, // Approximate
    optimizedTax: Math.max(0, taxableIncome * 0.25 - estimatedSavings),
    recommendations,
    priorityActions,
  };
}

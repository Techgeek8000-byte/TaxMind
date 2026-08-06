import { NextResponse } from 'next/server';

const TAX_GUIDE_CONTENT = [
  {
    id: 'income-tax-overview',
    title: 'Income Tax in Pakistan - Complete Overview',
    category: 'income_tax',
    icon: 'FileText',
    content: `# Income Tax in Pakistan

Income tax is the most significant direct tax in Pakistan, governed by the **Income Tax Ordinance, 2001** and administered by the **Federal Board of Revenue (FBR)**. Every individual, association of persons (AOP), and company earning income above the taxable threshold is required to file an annual tax return.

## Who Must File?

- **Salaried individuals** with annual income exceeding PKR 600,000
- **Business individuals** with annual turnover exceeding PKR 100 million or income exceeding PKR 400,000
- **Companies** (all companies must file regardless of income)
- **AOPs** with annual income exceeding PKR 400,000
- **Anyone owning** immovable property above certain value, owning a motor vehicle above 1000cc, or holding a foreign bank account

## Tax Year

Pakistan follows a **July 1 to June 30** fiscal year. Tax Year 2024-2025 covers income from July 1, 2024 to June 30, 2025. Returns are typically due by **September 30** (extended to December 31 with surcharge in recent years).

## Tax Rates (TY 2024-2025)

### Salaried Individuals
| Income Range (PKR) | Tax Rate |
|---|---|
| 0 - 600,000 | 0% |
| 600,001 - 1,200,000 | 5% |
| 1,200,001 - 2,200,000 | PKR 30,000 + 15% of excess over 1,200,000 |
| 2,200,001 - 3,200,000 | PKR 180,000 + 25% of excess over 2,200,000 |
| 3,200,001 - 4,100,000 | PKR 430,000 + 30% of excess over 3,200,000 |
| Above 4,100,000 | Progressive rates up to 35% |

### Non-Salaried Individuals / AOP
| Income Range (PKR) | Tax Rate |
|---|---|
| 0 - 600,000 | 0% |
| 600,001 - 1,200,000 | 15% |
| 1,200,001 - 1,600,000 | PKR 90,000 + 20% of excess |
| 1,600,001 - 3,200,000 | PKR 170,000 + 30% of excess |
| 3,200,001 - 5,600,000 | PKR 650,000 + 40% of excess |
| Above 5,600,000 | PKR 1,610,000 + 45% of excess |

### Companies
- **Banking companies**: 39%
- **Small companies**: 20%
- **Other companies**: 29%
- **IT Export companies**: 1% (first 3 years), 0.25% (afterward)

## Key Concepts

### Resident vs Non-Resident
Residents are taxed on worldwide income. Non-residents are taxed only on Pakistan-source income. You are considered a resident if you stay in Pakistan for 183+ days in the tax year.

### Heads of Income
1. **Salary** (Section 12)
2. **Income from Property** (Section 15)
3. **Income from Business** (Section 18)
4. **Capital Gains** (Section 37)
5. **Income from Other Sources** (Section 39)

Each head is computed separately, then aggregated for total income.`,
  },
  {
    id: 'deductions-credits',
    title: 'Tax Deductions & Credits - Complete Guide',
    category: 'exemptions',
    icon: 'Receipt',
    content: `# Tax Deductions & Credits

Pakistan's Income Tax Ordinance provides several legal avenues to reduce your taxable income. Understanding and properly claiming these deductions can significantly reduce your tax liability.

## Major Deductions

### Section 60 - Zakat
Zakat deducted at source by banks on savings/profit accounts is allowed as a tax credit. Ensure your bank has your Zakat exemption certificate if you are already paying Zakat privately.

**Maximum**: Actual amount of Zakat paid

### Section 61 - Charitable Donations
Donations to FBR-approved charitable institutions are deductible:
- **Normal donations**: Up to 30% of taxable income
- **Disaster relief donations**: 100% deductible (no limit)

**Approved institutions include**: Shaukat Khanum Memorial Trust, Edhi Foundation, The Citizens Foundation, and hundreds of others listed on FBR's website.

### Section 62A - Investment in Listed Securities
One of the most powerful deductions. Invest in newly issued shares (IPO/right shares) of PSX-listed companies:
- **Maximum credit**: 20% of taxable income OR PKR 2,000,000 (whichever is lower)
- **Holding period**: Must hold for 2 years
- **This is a TAX CREDIT** - directly reduces tax, not just income

### Section 63 - Pension Fund
Contributions to SECP-approved Voluntary Pension Funds (VPF):
- **Maximum**: 20% of taxable income
- **Lock-in**: 5 years minimum
- Provides both tax saving AND retirement benefit

### Section 64 - Life Insurance
Premium paid on life insurance policies:
- **Maximum**: 20% of taxable income
- Must be from SECP-registered insurance company
- Dual benefit: tax saving + life coverage

### Section 65A - Education Fee
Tuition fees for children's education:
- **Maximum**: 5% of taxable income
- Institution must be HEC/Board recognized
- Applies to children only (not self-education)

### Section 65B - Health Insurance
Health insurance premium for self, spouse, and children:
- **Maximum**: 5% of taxable income
- Must be from a registered Pakistani insurance company

### Section 65 - House Building Loan Interest
Interest on mortgage for own residence:
- **Maximum**: 25% of taxable income
- Only interest component (not principal)
- Loan must be from scheduled bank/HFC

## Important Notes

1. **Aggregate limit**: Some deductions (Sections 62A, 63, 64, 65A, 65B) may have combined limits
2. **Documentation**: Always maintain proper receipts and certificates
3. **Filing deadline**: Deductions can only be claimed in the tax year they are paid
4. **Filer status**: Some deductions require active filer status on ATL

## Tax Credits vs Deductions

| | Deduction | Tax Credit |
|---|---|---|
| Effect | Reduces taxable income | Directly reduces tax |
| Value | Deduction × Tax Rate | Full amount |
| Example | PKR 100K deduction at 25% = PKR 25K saving | PKR 100K credit = PKR 100K saving |

Tax credits (like Section 62A) are significantly more valuable than deductions.`,
  },
  {
    id: 'withholding-tax',
    title: 'Withholding Tax - Complete Reference',
    category: 'withholding',
    icon: 'Landmark',
    content: `# Withholding Tax (WHT) in Pakistan

Withholding tax is collected at source by various entities when transactions occur. It is an advance payment of your income tax and can be adjusted against your final tax liability.

## Filer vs Non-Filer Rates

Active filers on the ATL (Active Taxpayers List) enjoy **half the WHT rate** compared to non-filers. This is one of the biggest incentives to file your tax return on time.

## Common Withholding Tax Rates

### Banking Transactions (Section 231A)
| Transaction | Filer Rate | Non-Filer Rate |
|---|---|---|
| Cash withdrawal > PKR 50,000/day | 0.6% | 1.2% |
| Bank transfer (non-filer) | 0.6% | 1.2% |

### Property Transactions
| Transaction | Filer Rate | Non-Filer Rate |
|---|---|---|
| Property purchase (Sec 236K) | 3% | 6% |
| Property sale (Sec 236C) | 3% | 6% |
| Property rent (Sec 155) | 15% | 20% |

### Vehicle Transactions
| Transaction | Filer Rate | Non-Filer Rate |
|---|---|---|
| Vehicle purchase > 1000cc (Sec 231) | 3% | 6% |
| Vehicle registration | Varies | Varies |

### Other Common WHT
| Category | Filer Rate | Section |
|---|---|---|
| Bank profit/deposit (Sec 151) | 15% | 30% (non-filer) |
| Dividends (Sec 150) | 15% | 30% (non-filer) |
| Services/contractors (Sec 153) | 15% | 20% |
| Goods supply (Sec 153) | 4.5% | 9% |
| Telephone/internet (Sec 236U) | 10% | 14% |
| Electricity (domestic) (Sec 235) | 7.5% | 10% |
| Electricity (industrial) (Sec 235) | 17% | 20% |
| Foreign travel (Sec 236W) | 4% | 6% |
| Education fee private (Sec 236I) | 5% | 10% |
| Insurance premium (Sec 236AA) | 5% | 10% |
| Marriage hall (Sec 236AH) | 10% | 15% |
| Professional fees (Sec 236P) | 10% | 15% |

## How to Claim WHT

All withholding tax paid during the year can be claimed as a tax credit in your annual return. You need:
1. **CPR (Computerized Payment Receipt)** numbers from each deduction
2. These are available on the FBR IRIS portal
3. Enter them in your return under "Tax Credits and Adjustments"

## Tips

1. **Always file on time** to maintain ATL status and get lower WHT rates
2. **Keep CPR records** from all transactions
3. **Verify WHT payments** on FBR's IRIS portal
4. **Non-filer penalty**: Double WHT rate is a massive cost - file even with zero income`,
  },
  {
    id: 'fbr-filing-guide',
    title: 'FBR Tax Filing Step-by-Step Guide',
    category: 'income_tax',
    icon: 'Upload',
    content: `# FBR Tax Filing - Step-by-Step Guide

Filing your tax return with the Federal Board of Revenue (FBR) is mandatory for all qualifying individuals and businesses. The process is done online through the **IRIS portal**.

## Prerequisites

1. **NTN (National Tax Number)** - Register at FBR if you don't have one
2. **Active ATL status** - File before deadline to stay on Active Taxpayers List
3. **All financial documents** - Salary certificates, bank statements, property records, investment proofs
4. **CPR numbers** - For all withholding tax paid

## Filing Steps

### Step 1: Access IRIS Portal
- Go to [iris.fbr.gov.pk](https://iris.fbr.gov.pk)
- Login with your NTN/CNIC and password
- If new user, register first using the "e-Enrollment" option

### Step 2: Select Return Form
- Navigate to "Declaration" > "Income Tax Return"
- Select the appropriate return form:
  - **ITR-1**: For salaried individuals
  - **ITR-2**: For business individuals/AOPs
  - **ITR-3/4/5/6**: For companies

### Step 3: Fill Income Details
- **Salary Income** (Schedule 1): Enter salary details from your employer's certificate
- **Property Income** (Schedule 2): Enter rental income and expenses
- **Business Income** (Schedule 3): Enter business profit/loss
- **Capital Gains** (Schedule 4): Enter gains from securities/property sales
- **Other Sources** (Schedule 5): Dividends, bank profit, foreign income

### Step 4: Claim Deductions
- Navigate to deductions section
- Enter all applicable deductions under relevant sections
- Attach supporting documents where required

### Step 5: Enter Tax Credits
- Enter all CPR numbers for withholding tax collected
- Enter tax credits under relevant sections
- The system will auto-calculate your tax

### Step 6: Review & Submit
- Review all entered data carefully
- Verify computed tax matches your calculation
- Check for any errors or warnings
- Submit the return

### Step 7: Payment
- If tax is due, generate a PSID/CPR
- Pay through designated bank (online or branch)
- Upload the payment receipt in IRIS

## Important Dates

| Event | Deadline |
|---|---|
| Normal filing | September 30 |
| Extended deadline (recently) | December 31 |
| With surcharge | December 31 |
| Late filing surcharge | Varies (usually PKR 1,000-40,000) |

## After Filing

1. **Save acknowledgment**: Download and save the filing acknowledgment
2. **Verify ATL**: Check your name appears on ATL within 2-3 weeks
3. **Keep records**: Maintain all supporting documents for 6 years
4. **Respond to notices**: If FBR issues any notice, respond within the given timeframe

## Common Mistakes to Avoid

1. **Missing income heads**: Declare ALL income from all sources
2. **Wrong deductions**: Only claim what you have proof for
3. **Incorrect CPRs**: Verify all withholding tax credits
4. **Late filing**: Results in surcharge and ATL removal
5. **Not filing at all**: ATL removal means double WHT rates everywhere`,
  },
  {
    id: 'tax-optimization-legal',
    title: 'Legal Tax Optimization Strategies',
    category: 'exemptions',
    icon: 'TrendingDown',
    content: `# Legal Tax Optimization in Pakistan

Tax optimization is the legal practice of arranging your financial affairs to minimize tax liability within the framework of the law. This is fundamentally different from tax evasion (which is illegal). The Income Tax Ordinance 2001 provides numerous provisions specifically designed to incentivize certain behaviors.

## Key Principle

> **Tax Avoidance vs Tax Evasion**: Tax avoidance uses legal provisions to reduce tax (permissible). Tax evasion uses illegal means like hiding income or falsifying records (criminal offense). This platform ONLY deals with legal tax optimization.

## Top Legal Strategies

### 1. Maximize All Available Deductions
The simplest and most effective strategy. Most taxpayers don't claim all deductions they're entitled to:
- Education fees (Section 65A)
- Health insurance (Section 65B)
- Charity donations (Section 61)
- Pension fund contributions (Section 63)
- Life insurance premiums (Section 64)

### 2. Section 62A - Share Investment Credit
This is often called the "golden deduction" because it's a tax CREDIT (not just deduction):
- Invest in newly issued PSX-listed shares
- Credit = up to 20% of taxable income (max PKR 2M)
- Hold for 2 years minimum
- **Impact**: Directly reduces your tax bill, not just your income

### 3. Pension Fund Optimization (Section 63)
- Contribute up to 20% of income to approved VPF
- Get immediate tax deduction
- Build retirement corpus simultaneously
- Tax-free partial withdrawals after 5 years

### 4. Maintain Active Filer Status
- Halves all withholding tax rates
- Saves significantly on banking, property, vehicle transactions
- Essential for business operations
- Just filing on time saves hundreds of thousands annually

### 5. Business Structure Optimization
- Choose the right business structure (sole proprietor, AOP, company)
- Each structure has different tax rates and deduction rules
- A company at 20% (small company) vs individual at 35% can save significantly
- IT companies can qualify for 1% tax rate

### 6. Foreign Remittance Benefit (Section 111(4))
- Foreign income remitted through proper channels is exempt
- Crucial for freelancers and exporters
- Must use official banking channels

### 7. Capital Gains Holding Period
- Securities held > 1 year: 12.5% tax
- Securities held < 1 year: 15% tax
- Property held > specific period: Lower rates apply
- Plan asset sales with holding periods in mind

### 8. Super Tax Planning
- Super tax applies on income above PKR 150 million
- Consider income spreading across family members (where legally permissible)
- Business restructuring can reduce exposure

## Documentation is Key

Every optimization strategy requires proper documentation:
- Investment certificates
- Donation receipts
- Bank statements
- Insurance policies
- Pension fund statements
- Property documents

Without documentation, FBR can disallow any claimed deduction or credit during audit.`,
  },
  {
    id: 'sales-tax-guide',
    title: 'Sales Tax & Federal Excise Duty',
    category: 'sales_tax',
    icon: 'Percent',
    content: `# Sales Tax in Pakistan

Sales tax is a major indirect tax in Pakistan, administered by FBR for goods and services at the federal level. Provincial revenue authorities handle sales tax on services within their respective provinces.

## Federal Sales Tax (FST)

### Standard Rate: 18%

This applies to most goods manufactured or imported in Pakistan, unless specifically exempted or zero-rated.

### Key Concepts

1. **Input Tax Adjustment**: Registered businesses can claim credit for sales tax paid on purchases (input tax) against sales tax collected on sales (output tax). The net amount is paid to FBR.

2. **Zero-Rating**: Exports and certain sectors (like IT exports under specific conditions) are zero-rated, meaning 0% sales tax applies but input tax can still be claimed.

3. **Exemptions**: Essential items like unbranded food items, medicines, educational materials, and agricultural inputs are exempt from sales tax.

### Registration Threshold
- **Mandatory registration**: Businesses with annual turnover exceeding PKR 4 million
- **Voluntary registration**: Available for businesses below threshold

### Filing
- **Monthly**: Sales tax return is filed monthly by the 18th of the following month
- **Quarterly**: For certain categories with turnover below PKR 10 million
- Filed through FBR's IRIS portal

## Provincial Sales Tax on Services

Each province has its own sales tax on services:

| Province | Rate | Administered By |
|---|---|---|
| Punjab | 16% | PRAL |
| Sindh | 16% | SRB |
| KPK | 16% | KPRA |
| Balochistan | 16% | BRA |
| ICT (Islamabad) | 16% | FBR |

## Federal Excise Duty (FED)

FED is levied on specific goods and services:
- **Cigarettes/tobacco**: Varies by tier
- **Cement**: PKR 2,000/ton + 3% advance tax
- **Beverages**: Varies
- **Airlines**: 2.5-5%
- **Banking services**: Varies
- **Telecommunication**: 19.5% (including sales tax)

## Key Compliance Requirements

1. **Invoice requirements**: Tax invoices must include NTN, registration number, and tax amount
2. **Record keeping**: Maintain records for 6 years
3. **E-filing**: All returns filed electronically through IRIS
4. **Time-barred adjustments**: Input tax claims must be made within specified timeframes`,
  },
];

export async function GET() {
  return NextResponse.json({ guides: TAX_GUIDE_CONTENT });
}

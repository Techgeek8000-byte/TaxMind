<div align="center">

# TaxMind Pakistan

### AI-Powered Tax Optimization Platform for Pakistan

**FBR-Compliant | 14 Legal Optimization Strategies | AI Document Analysis | Vercel-Ready**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## What is TaxMind?

TaxMind Pakistan is a production-ready web application that helps Pakistani individuals and businesses **minimize their tax liability legally** using AI-powered document analysis, FBR-compliant calculations, and 14 optimization strategies based on the Income Tax Ordinance 2001.

Upload your salary slips, bank statements, or tax returns — the AI reads them, extracts financial data, and pre-fills the tax calculator. Then the optimizer suggests every legal deduction and exemption to reduce your tax to the absolute minimum.

---

## Key Features

### AI Document Analysis
- Upload salary slips, bank statements, tax certificates, property documents
- AI vision extracts: NTN, CNIC, income figures, tax deducted, deductions, exemptions
- Pre-fills the tax calculator automatically from extracted data
- **Free with Google Gemini API** (15 requests/minute, no credit card)

### FBR-Compliant Tax Engine
- All 5 income heads: Salary, Business, Property, Capital Gains, Other
- 10 deduction sections under ITO 2001
- Tax Year 2024-2025 slab rates with super tax computation
- Withholding tax (WHT) tracking across 14 categories
- **Generates FBR-uploadable return data** in the correct format

### 14 Legal Tax Optimization Strategies
Every strategy references the specific ITO 2001 section:

| # | Strategy | ITO Section | Savings Potential |
|---|----------|-------------|-------------------|
| 1 | Salary Allowance Optimization | Sec 12 | PKR 50,000–200,000/year |
| 2 | Employer Provident Fund | Sec 63 | Up to 20% of salary |
| 3 | Pension Fund Contributions | Sec 63(2) | PKR 100,000–500,000/year |
| 4 | Charitable Donations | Sec 61 | Up to 30% of income |
| 5 | Zakat Deduction | Sec 60 | As per actual paid |
| 6 | Health Insurance | Sec 62 | PKR 50,000–150,000/year |
| 7 | Education Allowance | Sec 12(2) | Up to PKR 100,000/child |
| 8 | Investment in Approved Schemes | Sec 64 | PKR 200,000–2,000,000/year |
| 9 | House Rent Allowance | Sec 10 | PKR 60,000–180,000/year |
| 10 | Vehicle Maintenance | Sec 12(3) | PKR 30,000–100,000/year |
| 11 | Business Expense Optimization | Sec 20-22 | Varies significantly |
| 12 | Property Tax Exemptions | Sec 15-16 | Up to PKR 300,000/year |
| 13 | Capital Gains Tax Relief | Sec 37-38 | Reduced rates on holding |
| 14 | Foreign Income Exemption | Sec 41 | 100% on certain income |

### Security & Auth
- Secure registration/login with bcrypt password hashing
- Google OAuth login (one-click)
- httpOnly session cookies
- Account lockout after 5 failed attempts
- Full audit logging

### Professional Guides
- 6 comprehensive tax guides for Pakistani taxpayers
- Step-by-step FBR filing instructions
- Deduction eligibility explanations with legal basis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL (Prisma ORM) |
| AI Vision | Google Gemini 2.0 Flash (free) / xAI Grok / OpenAI |
| Auth | Custom (bcrypt + httpOnly cookies) + Google OAuth |
| State | Zustand |
| Deployment | Vercel (serverless) |

---

## Quick Start (Vercel Deploy)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "TaxMind Pakistan v2.0"
git remote add origin https://github.com/YOUR_USERNAME/taxmind-pakistan.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. Vercel auto-detects Next.js — click **Deploy**

### 3. Set Environment Variables

In Vercel → Settings → Environment Variables:

| Variable | Required | How to Get |
|----------|----------|-----------|
| `DATABASE_URL` | **Yes** | Create free Postgres on [Neon](https://neon.tech) or [Supabase](https://supabase.com) |
| `GEMINI_API_KEY` | **Yes** (for AI) | Free at [Google AI Studio](https://aistudio.google.com/apikey) |
| `GOOGLE_CLIENT_ID` | No | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | No | Same as above |

> **That's it!** Two env vars and you're live. Gemini is 100% free.

### 4. Push Database Schema

After first deploy, run:

```bash
npx prisma db push
```

Or use Vercel Postgres: Storage → Your DB → **Push** tab.

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
npm install -g prisma
npx prisma generate

cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and GEMINI_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## AI Providers (Free to Premium)

TaxMind supports 3 AI vision providers. Set the API key in your env vars:

| Provider | Cost | Quality | Setup |
|----------|------|---------|-------|
| **Google Gemini** | **FREE** (15 req/min) | Excellent | [Get Key](https://aistudio.google.com/apikey) |
| xAI Grok | ~$2/1M tokens | Excellent | [Get Key](https://console.x.ai/) |
| OpenAI | ~$0.15/1K images | Excellent | [Get Key](https://platform.openai.com/api-keys) |

**Recommendation**: Use **Gemini** — it's free, fast, and handles Pakistani document formats well.

Priority order: Gemini → Grok → OpenAI (auto-fallback if one fails).

---

## Project Structure

```
taxmind-pakistan/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Full SPA (landing, dashboard, all views)
│   │   ├── layout.tsx            # Root layout with fonts
│   │   └── api/
│   │       ├── auth/             # Login, register, Google OAuth, session
│   │       ├── documents/        # Upload & AI analysis
│   │       ├── tax/              # Calculate, optimize, guides
│   │       └── audit/            # Audit logs
│   ├── lib/
│   │   ├── tax-engine.ts         # FBR-compliant tax calculator
│   │   ├── tax-optimizations.ts  # 14 legal strategies
│   │   ├── ai-provider.ts        # Gemini/Grok/OpenAI vision
│   │   ├── auth.ts               # Auth + session management
│   │   └── db.ts                 # Prisma client
│   └── components/ui/            # shadcn/ui components
├── prisma/
│   └── schema.prisma             # PostgreSQL schema
├── .env.example                  # Environment template
├── DEPLOY.md                     # Detailed deployment guide
└── vercel.json                   # Vercel build config
```

---

## Why TaxMind Over Others?

| Feature | TaxMind | Tax Asaan | FBR Iris |
|---------|---------|-----------|----------|
| AI Document Scanning | Gemini/Grok Vision | Manual Entry Only | Manual Entry Only |
| Tax Optimization | 14 Legal Strategies | None | None |
| Legal Loophole Detection | ITO 2001 References | No | No |
| FBR Upload Format | Auto-Generated | No | Native (manual) |
| Pakistani Tax Law | Full ITO 2001 | Basic | Full (hard to use) |
| Free AI | Gemini Free Tier | No AI | No AI |
| Modern UI | Professional SPA | Basic | Government UI |

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For deployment issues, see [DEPLOY.md](DEPLOY.md) for the complete troubleshooting guide.

<div align="center">

**Built for Pakistan, by Pakistanis.**

</div>
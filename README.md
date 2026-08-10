<div align="center">

<img src="public/icon.svg" width="80" height="80" alt="TaxMind Logo" />

# 💡 TaxMind Pakistan

### AI-Powered Tax Optimization for Pakistan's FBR Tax System

[![Live Demo](https://img.shields.io/badge/Live-https://tax--mind.vercel.app-10b981?style=flat-square&logo=vercel&logoColor=white)](https://tax-mind.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

TaxMind Pakistan is a full-stack, production-ready web platform that helps Pakistani individuals, businesses, and tax professionals **file accurate FBR returns and legally minimize tax liability** using AI.

Upload your CNIC, salary slips, bank statements, or property documents — the AI extracts financial data instantly, pre-fills the tax calculator, and runs **14+ legal optimization strategies** under the Income Tax Ordinance 2001 to find every possible deduction and exemption.

---

## ✨ Features

### 🧠 AI-Powered
- **Document Scanner** — Upload salary slips, bank statements, CNIC, tax certificates; AI extracts all financial data in seconds
- **Tax Chat** — Ask tax questions in plain English, get Pakistan-specific answers with ITO 2001 references
- **Smart Optimization Engine** — Automatically identifies every legal deduction, exemption, and credit you qualify for

### 📊 FBR-Compliant Tax Engine
- All **5 income heads**: Salary, Business, Property, Capital Gains, Other Sources
- Tax Year **2024-2025** slab rates with super tax & minimum tax
- **Withholding Tax** calculator across 29+ categories
- **Wealth Statement** (Form WH) generator
- **IRIS XML Export** — generates FBR-uploadable return data
- **Presumptive Tax** calculator under Sections 113-116

### 🔐 Security & Authentication
- Email/password login with bcrypt hashing
- **Google OAuth** one-click sign-in
- httpOnly session cookies (JWT-based)
- Account lockout after 5 failed attempts
- Full audit logging

### 📚 Knowledge Base
- 6+ comprehensive tax guides for Pakistani taxpayers
- Step-by-step FBR filing instructions
- Deduction eligibility with legal section references

### 🎨 UI/UX
- Dark-mode-first professional interface
- Responsive design (mobile, tablet, desktop)
- Animated dashboards with real-time stats
- shadcn/ui component system

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) via Prisma ORM 6 |
| **AI** | HuggingFace → Google Gemini → xAI Grok → OpenAI |
| **Auth** | Custom JWT + Google OAuth (`@react-oauth/google`) |
| **State** | Zustand |
| **Animations** | Framer Motion |
| **Hosting** | Vercel (Serverless) |

---

## 🚀 Quick Deploy to Vercel

### Prerequisites
- A [Neon](https://neon.tech) PostgreSQL database (free tier)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free)
- A [Google Cloud Console](https://console.cloud.google.com/apis/credentials) OAuth client (free)

### Steps

**1. Fork & Clone**
```bash
git clone https://github.com/Techgeek8000-byte/TaxMind.git
cd TaxMind
```

**2. Push Database Schema**
```bash
npx prisma db push
```

**3. Deploy on Vercel**
- Go to [vercel.com](https://vercel.com) → **New Project** → Import repo → Deploy

**4. Add Environment Variables** in Vercel → Settings → Environment Variables:

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `DIRECT_DATABASE_URL` | ✅ | Neon direct connection string |
| `JWT_SECRET` | ✅ | Random string (min 32 chars) |
| `HF_API_KEY` | ✅ | [HuggingFace](https://huggingface.co/settings/tokens) API token (free) |
| `GEMINI_API_KEY` | ⚪ | [Google AI Studio](https://aistudio.google.com/apikey) key (free fallback) |
| `GOOGLE_CLIENT_ID` | ⚪ | Google Cloud OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⚪ | Google Cloud OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ⚪ | Same as `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_APP_URL` | ⚪ | Your Vercel URL (e.g. `https://tax-mind.vercel.app`) |

**5. Redeploy** — Vercel will build automatically with the new env vars.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and API keys

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # SPA entry (landing, dashboard, all views)
│   ├── layout.tsx               # Root layout + Google OAuth Provider
│   ├── not-found.tsx            # Custom 404 page
│   ├── error.tsx                # Error boundary page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts       # Email/password login
│       │   ├── register/route.ts    # User registration
│       │   ├── google/route.ts      # Google OAuth (JWT verification)
│       │   ├── me/route.ts          # Get current user
│       │   └── logout/route.ts      # Clear session
│       ├── tax/
│       │   ├── calculate/route.ts   # Tax computation engine
│       │   ├── optimize/route.ts    # AI optimization strategies
│       │   ├── iris-xml/route.ts    # IRIS export
│       │   ├── presumptive/route.ts # Presumptive tax
│       │   └── wealth-statement/route.ts
│       ├── documents/
│       │   ├── route.ts              # Document list
│       │   └── scan/route.ts         # AI document analysis
│       ├── ai/chat/route.ts         # AI tax chat
│       ├── guides/route.ts          # Tax guides
│       ├── audit/route.ts           # Audit logging
│       └── dashboard/stats/route.ts # Dashboard statistics
├── components/
│   ├── auth/AuthForms.tsx        # Login/Register with Google OAuth
│   ├── landing/LandingPage.tsx    # Full landing page
│   ├── dashboard/                 # Dashboard components
│   ├── tax/                       # Calculator, reports, IRIS export
│   ├── ai/TaxChat.tsx             # AI chat interface
│   ├── scanner/DocumentScanner.tsx
│   ├── guides/TaxGuides.tsx
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── tax-engine.ts             # FBR ITO 2001 tax calculator
│   ├── tax-optimizations.ts      # 14+ legal strategies
│   ├── ai-provider.ts            # Multi-provider AI (HF → Gemini → Grok → OpenAI)
│   ├── auth.ts                   # JWT + session management
│   ├── audit.ts                  # Audit logging
│   └── db.ts                     # Prisma client singleton
├── store/app.ts                  # Zustand global state
└── providers/
    └── GoogleOAuthProvider.tsx   # Google OAuth wrapper
prisma/
└── schema.prisma                 # PostgreSQL schema (User, Document, TaxCalculation, AuditLog, TaxGuide)
```

---

## 🤖 AI Provider Cascade

TaxMind uses multiple AI providers with automatic fallback:

| Priority | Provider | Cost | Quality | Status |
|:--------:|----------|------|---------|--------|
| 1st | **HuggingFace** | **Free** | Good | Default |
| 2nd | **Google Gemini** | **Free** | Excellent | Fallback |
| 3rd | xAI Grok | Paid | Excellent | Optional |
| 4th | OpenAI GPT-4o | Paid | Excellent | Optional |

> **Only `HF_API_KEY` is strictly required.** The rest are optional fallbacks.

---

## ⚖️ 14 Legal Tax Optimization Strategies

Every strategy references the specific ITO 2001 section:

| # | Strategy | Section | Savings Potential |
|---|----------|:-------:|-------------------|
| 1 | Salary Allowance Optimization | Sec 12 | PKR 50K–200K/yr |
| 2 | Employer Provident Fund | Sec 63 | Up to 20% of salary |
| 3 | Pension Fund Contributions | Sec 63(2) | PKR 100K–500K/yr |
| 4 | Charitable Donations | Sec 61 | Up to 30% of income |
| 5 | Zakat Deduction | Sec 60 | As per actual paid |
| 6 | Health Insurance | Sec 62 | PKR 50K–150K/yr |
| 7 | Education Allowance | Sec 12(2) | Up to PKR 100K/child |
| 8 | Investment in Approved Schemes | Sec 64 | PKR 200K–2M/yr |
| 9 | House Rent Allowance | Sec 10 | PKR 60K–180K/yr |
| 10 | Vehicle Maintenance | Sec 12(3) | PKR 30K–100K/yr |
| 11 | Business Expense Optimization | Sec 20-22 | Varies |
| 12 | Property Tax Exemptions | Sec 15-16 | Up to PKR 300K/yr |
| 13 | Capital Gains Tax Relief | Sec 37-38 | Reduced rates |
| 14 | Foreign Income Exemption | Sec 41 | 100% on certain income |

---

## 📸 Screenshots

> 📱 Visit [tax-mind.vercel.app](https://tax-mind.vercel.app) for the live demo.

<!-- Add screenshots here:
![Landing Page](screenshots/landing.png)
![Dashboard](screenshots/dashboard.png)
![Tax Calculator](screenshots/calculator.png)
![AI Document Scanner](screenshots/scanner.png)
-->

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a **Pull Request**

### Areas We'd Love Help With
- 🌐 Urdu language support
- 📱 PWA (Progressive Web App) support
- 🔔 FBR deadline notifications
- 📊 More chart visualizations
- 🧪 Unit & integration tests
- 📖 More tax guides

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for Pakistan 🇵🇰, by Pakistanis.**

Made with ❤️ by [Techgeek8000-byte](https://github.com/Techgeek8000-byte)

</div>

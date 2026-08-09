# TaxMind Pakistan

AI-Powered FBR Tax Optimization Platform for Pakistan — compliant with Income Tax Ordinance 2001, Tax Year 2024-2025.

## Features

- **Tax Calculator** — 5 income heads (salary, business, property, capital gains, other) with FBR progressive slabs
- **26 Legal Tax Optimization Strategies** — Sec 60-65E deductions, Sec 111(4) investment scheme, presumptive tax election, accelerated depreciation, foreign tax credit, treaty shopping
- **29 Withholding Tax Types** — Bank profit, dividend, services, property, vehicle, professional fees and more
- **AI Document Scanner** — Upload salary slips, tax returns, bank statements; AI extracts data automatically
- **Wealth Statement Generator** — FBR Sec 116 reconciliation with opening/closing wealth
- **IRIS XML Export** — Download FBR-compatible XML for e-filing
- **Tax Savings Score** — 0-100 optimization score with per-strategy PKR savings
- **Presumptive Tax Calculator** — Compare normal vs final tax regime (Sec 113-116B)
- **Capital Gains Calculator** — Holding period-based CGT for securities and property
- **Tax Calendar** — FBR filing deadlines for TY 2024-2025
- **AI Tax Chat** — Ask questions about Pakistani tax law
- **6 Tax Guides** — Salary tax, business tax, property income, capital gains, withholding tax, presumptive tax
- **Dashboard** — Recharts visualizations, KPI stats, recent calculations
- **Audit Log** — Full activity trail with IP tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Neon PostgreSQL + Prisma ORM |
| Auth | JWT (jose) + bcrypt + Google OAuth |
| AI | HuggingFace Qwen2.5-VL → Gemini → Grok → OpenAI |
| Charts | Recharts |
| State | Zustand |
| Animation | Framer Motion |

## Getting Started

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all variables. Minimum required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `DIRECT_DATABASE_URL` | Neon PostgreSQL direct connection string |
| `JWT_SECRET` | Random string for JWT signing |
| `HF_API_KEY` | HuggingFace API key (free) |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for full Vercel deployment guide.

## License

Private — All rights reserved.

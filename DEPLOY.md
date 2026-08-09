# TaxMind Pakistan - Deployment Guide

## Prerequisites

- **Node.js 18+** (LTS recommended) — [Download](https://nodejs.org/)
- **Git** account with SSH or HTTPS access configured
- **Vercel** account (free Hobby tier works) — [vercel.com/signup](https://vercel.com/signup)
- **Neon PostgreSQL** account (free tier: 0.5 GB) — [neon.tech](https://neon.tech)
- (Optional) At least one AI API key for document scanning features

---

## Step 1: Push to GitHub

1. **Initialize and commit** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "chore: initial commit - TaxMind Pakistan"
   ```

2. **Create a repository** on GitHub — do **not** initialize with README/LICENSE/gitignore (your local project already has these).

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/taxmind-pakistan.git
   git branch -M main
   git push -u origin main
   ```

4. Verify the code is visible at `https://github.com/YOUR_USERNAME/taxmind-pakistan`.

---

## Step 2: Set Up Neon PostgreSQL

TaxMind uses Prisma ORM. For Vercel deployment, Neon's serverless PostgreSQL is the recommended database.

1. **Create a Neon project** at [neon.tech/app](https://neon.tech/app):
   - Choose a region closest to your users (Singapore recommended for Pakistan traffic).
   - Name the project (e.g., `taxmind-pakistan`).

2. **Get your connection strings** from the Neon dashboard → **Connection Details**:
   - Copy the **Pooled connection string** → this is your `DATABASE_URL`
   - Copy the **Direct connection string** → this is your `DIRECT_DATABASE_URL`

   Both will look like:
   ```
   postgresql://neondb_owner:xxxxx@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   ```

   > **Important**: The pooled URL includes `?sslmode=require&pgbouncer=true` (or `&connect_timeout=15`). The direct URL may have `?sslmode=require` without pgbouncer.

3. **Keep this tab open** — you'll need these URLs in Step 3.

---

## Step 3: Configure Vercel Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and import your GitHub repository.
2. Before deploying, go to **Settings → Environment Variables** and add **all 14 variables** listed below.

| # | Variable | Example Value | Description |
|---|----------|--------------|-------------|
| 1 | `NODE_ENV` | `production` | Set automatically by Vercel; ensures Prisma uses production mode. |
| 2 | `DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true` | **Pooled** Neon connection string. Used by Prisma at runtime via connection pooling. |
| 3 | `DIRECT_DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require` | **Direct** Neon connection string. Used by `prisma db push` and migrations (no pgbouncer). |
| 4 | `JWT_SECRET` | `your-64-char-random-string-here` | Secret key for signing JWT session tokens. **Generate a strong random string** (see below). |
| 5 | `HF_API_KEY` | `hf_xxxxxxxxxxxxxxxxxxxxx` | HuggingFace Inference API key. **Free tier available** — get yours at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens). Used for AI document scanning. |
| 6 | `HUGGING_FACE_API_KEY` | `hf_xxxxxxxxxxxxxxxxxxxxx` | Alias for HuggingFace key (backward compatibility). Set to same value as `HF_API_KEY`. |
| 7 | `GEMINI_API_KEY` | `AIzaSyxxxxxxxxxxxxxxxxxxxx` | Google Gemini API key. Fallback AI provider. Get at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). |
| 8 | `XAI_API_KEY` | `xai-xxxxxxxxxxxxxxxxxxxx` | xAI (Grok) API key. Fallback AI provider. Get at [console.x.ai](https://console.x.ai). |
| 9 | `OPENAI_API_KEY` | `sk-xxxxxxxxxxxxxxxxxxxx` | OpenAI API key. Final fallback AI provider. Get at [platform.openai.com/api-keys](https://platform.openai.com/api-keys). |
| 10 | `NEXT_PUBLIC_APP_URL` | `https://taxmind-pakistan.vercel.app` | Public base URL of your deployed app. Used for client-side redirects and SEO. |
| 11 | `NEXT_PUBLIC_APP_NAME` | `TaxMind Pakistan` | Display name of the application. |
| 12 | `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js anonymous telemetry. Set to `1` for production. |
| 13 | `VERCEL_URL` | *(auto-set)* | Automatically set by Vercel. Do not set manually. |
| 14 | `MAX_TAX_CALCULATIONS` | `100` | Optional. Maximum number of tax calculations stored per user. Default: unlimited. |

### Generate a Strong JWT_SECRET

```bash
# Using OpenSSL (macOS/Linux)
openssl rand -base64 48

# Using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Using Bun
bun -e "console.log(crypto.randomBytes(48).toString('base64'))"
```

### AI Key Priority

The AI system uses a **4-provider cascade**: HuggingFace → Gemini → Grok → OpenAI. You only need **at least one** key for AI features to work. **HF_API_KEY is free** and recommended as the starting point.

---

## Step 4: Deploy

1. **Import repository on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Click **"Add Git Repository"** and select your `taxmind-pakistan` repo.
   - **Framework Preset**: Vercel will auto-detect **Next.js**.
   - **Build Command**: Should auto-detect as `prisma generate && next build` (from `package.json`).
   - **Install Command**: Should auto-detect as `bun install` or `npm install`.

2. **Configure Build Settings** (if not auto-detected):
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Next.js |
   | Build Command | `prisma generate && next build` |
   | Install Command | `npm install` (or `bun install`) |
   | Output Directory | `.next` |
   | Node.js Version | 18.x |

3. **Click Deploy**. Vercel will:
   - Install dependencies (runs `postinstall` → `prisma generate`)
   - Build the Next.js application
   - Deploy to its global edge network

4. **Wait for the build** (typically 2–4 minutes on first deploy).

5. Once deployed, visit your URL: `https://taxmind-pakistan-xxx.vercel.app`

---

## Step 5: Post-Deploy

### 5.1 Initialize the Database Schema

After the first deploy, push the Prisma schema to Neon:

```bash
# Install the Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables locally
vercel env pull .env.local

# Push the schema to the production database
npx prisma db push
```

### 5.2 Verify Everything Works

- [ ] App loads at the Vercel URL
- [ ] User registration works (creates account in Neon DB)
- [ ] Login works and sets session cookie
- [ ] Tax calculator computes correctly
- [ ] Document scanning works (if AI key is configured)
- [ ] Reports page loads and shows chart visualizations
- [ ] CSV export downloads correctly
- [ ] FBR Return JSON dialog renders properly
- [ ] Print / PDF report generates correctly

### 5.3 Custom Domain (Optional)

1. Go to **Vercel Dashboard → Settings → Domains**
2. Add your domain (e.g., `taxmind.pk`)
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_APP_URL` environment variable to match

---

## Troubleshooting

### 1. Build Fails: "prisma generate" error

**Cause**: Prisma client not generated before build.

**Fix**: Ensure your `package.json` scripts include:
```json
{
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```
Vercel runs `postinstall` automatically after `npm install`.

### 2. Runtime Error: "PrismaClient is not able to run in this browser environment"

**Cause**: Prisma is imported on the client side.

**Fix**: Ensure all Prisma imports are in server-side code only (API routes, `'use server'` functions, Server Components). The project uses a lazy Prisma client (`src/lib/db.ts`) that avoids this, but double-check no client component imports `@/lib/db` directly.

### 3. Database Connection Timeout

**Cause**: Using the wrong connection string or network latency.

**Fix**:
- Use the **pooled** `DATABASE_URL` (with `?pgbouncer=true`) for runtime.
- Use the **direct** `DIRECT_DATABASE_URL` (without pgbouncer) only for migrations.
- Add `?connect_timeout=15` to the URL if needed.
- Ensure the Neon region is not too far from Vercel's deployment region.

### 4. "Invalid JWT" or Authentication Issues

**Cause**: `JWT_SECRET` is not set or changed between deploys.

**Fix**: Set a strong, persistent `JWT_SECRET` in Vercel environment variables. If you change it, all existing sessions will be invalidated (users must log in again).

### 5. AI Document Scanning Returns "No AI API key configured"

**Cause**: No AI provider keys are set.

**Fix**: Set at least `HF_API_KEY` (free) in Vercel environment variables. The cascade tries HuggingFace first, then Gemini, Grok, and OpenAI.

### 6. White Screen / 500 Error After Deploy

**Cause**: Missing environment variables or build-time database connection.

**Fix**:
1. Check Vercel deploy logs for the specific error.
2. Verify all 14 environment variables are set in Vercel dashboard.
3. Ensure `DATABASE_URL` is **not** required at build time (the project uses a lazy Prisma client to avoid this).
4. Redeploy: `vercel --prod`

### 7. Prisma Schema Push Fails

**Cause**: Direct connection URL not configured or SSL issues.

**Fix**:
```bash
# Verify direct connection works
npx prisma db push --url="YOUR_DIRECT_DATABASE_URL"

# If SSL issues, ensure sslmode=require is in the URL
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Next.js 16 App Router                      │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │  Client UI    │  │  API Routes  │  │  Server Actions  │  │   │
│  │  │  (React 19)   │  │  /api/*      │  │  (use server)    │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │  - Zustand   │  │  - Auth      │  │  - Tax Compute   │  │   │
│  │  │  - TanStack  │  │  - Tax Calc  │  │  - Data Mutate   │  │   │
│  │  │  - Recharts  │  │  - Documents │  │                  │  │   │
│  │  │  - Framer    │  │  - AI Scan   │  │                  │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │   │
│  │         │                 │                    │            │   │
│  │         └────────────┬────┴────────────────────┘            │   │
│  │                      │                                      │   │
│  │         ┌────────────┴────────────────────┐                │   │
│  │         │         Service Layer           │                │   │
│  │         │                                  │                │   │
│  │         │  ┌──────────┐  ┌──────────────┐ │                │   │
│  │         │  │  Prisma  │  │  Tax Engine  │ │                │   │
│  │         │  │  ORM     │  │  (FBR ITO)   │ │                │   │
│  │         │  └────┬─────┘  └──────────────┘ │                │   │
│  │         └──────┼──────────────────────────┘                │   │
│  └────────────────┼───────────────────────────────────────────┘   │
│                   │                                                │
└───────────────────┼────────────────────────────────────────────────┘
│                   │                                                │
│         ┌─────────┴──────────┐       ┌───────────────────────────┐
│         │   Neon PostgreSQL  │       │    AI Providers           │
│         │                    │       │                           │
│         │  ┌──────────────┐  │       │  1. HuggingFace (free)   │
│         │  │   Users      │  │       │  2. Google Gemini        │
│         │  │   Tax Calcs  │  │       │  3. xAI (Grok)           │
│         │  │   Documents  │  │       │  4. OpenAI               │
│         │  └──────────────┘  │       └───────────────────────────┘
│         │   Serverless      │
│         │   Connection      │
│         │   Pooling         │
│         └────────────────────┘
│
│  EXTERNAL SERVICES
│  ┌─────────────────────────────────────────────────────────────┐
│  │  - JWT (jose) for session management (no NextAuth)          │
│  │  - bcryptjs for password hashing                            │
│  │  - FBR Tax Engine (in-house, no external API)               │
│  └─────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────

DATA FLOW:
  User → Client (Zustand) → API Route → Service Layer → Prisma → Neon DB
  User → Client → API Route → Tax Engine → FBR Return JSON / PDF
  User → Client → API Route → AI Cascade (HF → Gemini → Grok → OpenAI)
```

---

## Environment Variables Reference Table

| Variable | Required | Runtime / Build | Default | Notes |
|----------|----------|-----------------|---------|-------|
| `NODE_ENV` | Auto | Runtime | `production` | Set by Vercel. Do not set manually. |
| `DATABASE_URL` | **Yes** | Runtime | — | Pooled Neon connection. **Must** include `?pgbouncer=true`. |
| `DIRECT_DATABASE_URL` | **Yes** | CLI / Migrations | — | Direct Neon connection. **No** pgbouncer. Used for `prisma db push`. |
| `JWT_SECRET` | **Yes** | Runtime | `taxmind-pakistan-secret-key-change-in-production` | **Must override** in production with a strong random string. |
| `HF_API_KEY` | No* | Runtime | — | Free HuggingFace API key. Primary AI provider. |
| `HUGGING_FACE_API_KEY` | No* | Runtime | — | Alias for `HF_API_KEY`. Set same value. |
| `GEMINI_API_KEY` | No* | Runtime | — | Google Gemini key. Fallback #1. |
| `XAI_API_KEY` | No* | Runtime | — | xAI (Grok) key. Fallback #2. |
| `OPENAI_API_KEY` | No* | Runtime | — | OpenAI key. Fallback #3. |
| `NEXT_PUBLIC_APP_URL` | No | Runtime / Build | — | Public URL. Update after first deploy. |
| `NEXT_PUBLIC_APP_NAME` | No | Build | — | Display name for the app. |
| `NEXT_TELEMETRY_DISABLED` | No | Build | — | Set to `1` to disable Next.js telemetry. |
| `VERCEL_URL` | Auto | Runtime | — | Auto-set by Vercel. Do not configure manually. |
| `MAX_TAX_CALCULATIONS` | No | Runtime | — | Per-user calculation limit. Omit for unlimited. |

> \* At least one AI key is required for document scanning features to work. The app functions fully for tax calculations without any AI keys.

---

## Quick Reference: Common Commands

```bash
# Install dependencies (also runs prisma generate via postinstall)
bun install

# Push schema to local SQLite database
bun run db:push

# Push schema to production Neon database
DATABASE_URL="your-pooled-url" DIRECT_DATABASE_URL="your-direct-url" npx prisma db push

# Run development server locally
bun run dev

# Lint check
bun run lint

# Build for production (locally)
bun run build

# Deploy to Vercel
vercel --prod

# Pull Vercel env vars to local .env.local
vercel env pull .env.local

# View Vercel deployment logs
vercel logs taxmind-pakistan --prod
```

---

## Security Checklist

- [ ] `JWT_SECRET` is set to a strong random string (not the default)
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] Environment variables are set in Vercel dashboard (not committed to Git)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] No AI API keys are committed to the repository
- [ ] Vercel deployment is using HTTPS (automatic)
- [ ] Session cookies use `httpOnly`, `secure`, and `sameSite: lax`
- [ ] Passwords are hashed with bcrypt (12 salt rounds)
- [ ] Rate limiting / lockout is enabled (5 attempts, 15 min lockout)

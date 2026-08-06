# TaxMind Pakistan - Vercel Deployment Guide

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "TaxMind Pakistan v2.0 - AI Tax Optimization Platform"
git remote add origin https://github.com/YOUR_USERNAME/taxmind-pakistan.git
git push -u origin main
```

## Step 2: Set Up Database (Free)

**Option A: Vercel Postgres (Easiest)**
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Click **Storage** tab → **Create Database** → **Postgres** → Hobby (free)
3. Vercel auto-sets `DATABASE_URL` environment variable

**Option B: Neon (Free, Independent)**
1. Go to [neon.tech](https://neon.tech) → Create project (free)
2. Copy the connection string (includes `?sslmode=require`)
3. In Vercel → Settings → Environment Variables → Add `DATABASE_URL`

**Option C: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string → URI format
3. Add as `DATABASE_URL` in Vercel

## Step 3: Set Up AI — FREE with Google Gemini (2 minutes)

TaxMind uses AI vision to read salary slips, bank statements, and tax documents.

**RECOMMENDED: Google Gemini (Free Tier)**

Gemini 2.0 Flash is free (15 requests/minute) and excellent for document analysis.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with Google → Click **"Create API Key"**
3. Copy the key
4. In Vercel → Settings → Environment Variables:
   - `GEMINI_API_KEY` = `your-key-here`
   - `GEMINI_MODEL` = `gemini-2.0-flash` (default, free)

**ALTERNATIVE 1: xAI Grok (Affordable, Strong Vision)**

Grok has excellent vision capabilities and uses the same API format as OpenAI.

1. Go to [console.x.ai](https://console.x.ai/) → Sign in / Create account
2. Navigate to **API Keys** → Create new key
3. Copy the key
4. In Vercel → Settings → Environment Variables:
   - `XAI_API_KEY` = `xai-...`
   - `XAI_MODEL` = `grok-4-latest` (best vision) or `grok-3-mini` (cheaper)

**ALTERNATIVE 2: OpenAI GPT-4o-mini (Paid, ~$0.15/1000 images)**

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new API key
3. In Vercel → Settings → Environment Variables:
   - `OPENAI_API_KEY` = `sk-...`
   - `OPENAI_MODEL` = `gpt-4o-mini`

**Priority**: If multiple keys are set, Gemini is tried first, then Grok, then OpenAI as fallback. If one fails, the next provider is automatically tried.

> **Note**: Without an AI key, the app still works fully — tax calculator, optimizer, guides, reports, FBR export all function. Only the document scanning feature shows "not configured".

## Step 4: Set Google OAuth Login (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create project → **APIs & Services** → **Credentials** → **Create OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized JavaScript origins: `https://your-app.vercel.app`
5. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/google`
6. In Vercel env vars: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Step 5: Set All Environment Variables

In Vercel → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `GEMINI_API_KEY` | **Yes** (for AI) | Google AI Studio API key (free) |
| `GEMINI_MODEL` | No | Default: `gemini-2.0-flash` |
| `XAI_API_KEY` | No | xAI Grok API key (affordable vision) |
| `XAI_MODEL` | No | Default: `grok-4-latest` |
| `OPENAI_API_KEY` | No | Fallback AI provider |
| `GOOGLE_CLIENT_ID` | No | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth login |
| `NEXTAUTH_URL` | Auto | Vercel sets automatically |

## Step 6: Deploy

1. Push to GitHub (if not already)
2. Vercel auto-deploys on push
3. First deploy: Vercel runs `prisma generate` then `next build`
4. After deploy, push database schema:
   - Vercel Postgres: Storage → Your DB → **"Push"** tab
   - Or locally: `npx prisma db push` (set DATABASE_URL first)

## Architecture

```
User uploads document (image/PDF)
    ↓
Upload API saves as base64 in PostgreSQL (no filesystem)
    ↓
User clicks "Analyze"
    ↓
Analyze API reads base64 from DB
    ↓
Sends to Google Gemini / xAI Grok / OpenAI via HTTP (Vercel-compatible)
    ↓
AI returns structured JSON: document type, income figures, NTN, deductions
    ↓
Results saved to DB, shown to user
    ↓
User can use extracted data to pre-fill tax calculator
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Prisma | Ensure vercel.json has `prisma generate` in buildCommand |
| Database connection error | `DATABASE_URL` must include `?sslmode=require` |
| AI analysis says "not configured" | Add `GEMINI_API_KEY`, `XAI_API_KEY`, or `OPENAI_API_KEY` to Vercel env vars |
| AI analysis fails | Check Vercel function logs for the actual error message |
| Google OAuth redirect error | Redirect URI must match `https://your-app/api/auth/google` exactly |
| Document upload fails | Ensure file is PNG/JPEG/WebP/PDF under 10MB |
| Page shows 500 error | Check Vercel → Dashboard → Functions tab for logs |
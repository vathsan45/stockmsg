# Automated Indian Stock Market Daily Intelligence Report Agent

A production-ready Next.js application that automatically generates a daily post-session Indian stock market (NSE/BSE) intelligence report, analyzes stock movements & news catalysts using Groq LLM, emails a responsive briefing via Resend, and stores historical reports in Supabase.

---

## Features

- **Automated Vercel Cron Scheduling**: Automatically triggers daily after the Indian stock market session closes (4:15 PM IST / 10:45 AM UTC on weekdays).
- **NSE Trading Day & Holiday Awareness**: Validates Indian market holidays (NSE/BSE calendar) and skips execution on weekends or holidays.
- **Deterministic Market Data Processing**: Fetches session quotes, NIFTY 50, and SENSEX performance data. Calculates gainers and losers percentage movements deterministically in code.
- **Targeted Financial News Collection**: Fetches news articles published on the trading date per top stock from NewsAPI and Google News RSS.
- **Groq LLM AI Analysis**: Interprets news catalysts using structured JSON schema output, classifying evidence levels (`HIGH`, `MEDIUM`, `LOW`, `SPECULATIVE`) and primary catalysts (`Earnings`, `Management Commentary`, `New Orders`, `Brokerage Upgrades/Downgrades`, etc.).
- **Polished Responsive HTML Email**: Renders desktop & mobile optimized briefings sent via **Resend**.
- **Supabase PostgreSQL Storage**: Full relational schema (`daily_reports`, `stock_movements`, `news_articles`, `stock_analysis`).
- **Interactive Dark-Mode Dashboard**: Sleek Next.js App Router UI showing live report details, ticker badges, AI insights, direct source links, and historical archive.
- **Manual Test Mode**: Protected `/api/test/daily-report` endpoint and web button for manual test runs without waiting for 4 PM.

---

## Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Required Variables:

```env
# 1. Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Groq LLM API
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# 3. Resend (Email Delivery)
RESEND_API_KEY=re_your_resend_api_key_here
REPORT_RECIPIENT_EMAIL=your_email@example.com
REPORT_FROM_EMAIL=Stock Intelligence <onboarding@resend.dev>

# 4. Security & Cron Secret
CRON_SECRET=super-secret-cron-token-12345

# 5. Development Mode (Set to "false" when ready to use live APIs)
USE_MOCK_DATA=true
```

---

## Database Migration (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy and execute the contents of [`supabase/schema.sql`](./supabase/schema.sql).

---

## Vercel Deployment Instructions

1. Push your codebase to GitHub/GitLab.
2. Import your repository into [Vercel](https://vercel.com).
3. In Vercel Project Settings -> **Environment Variables**, add all environment variables from `.env.local`.
4. Deploy the project. Vercel will automatically detect `vercel.json` and schedule the daily Vercel Cron at `45 10 * * 1-5` (10:45 AM UTC / 4:15 PM IST).

---

## Manual Pipeline Test Endpoint

You can manually trigger a report generation at any time:

```bash
curl -X POST http://localhost:3000/api/test/daily-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer super-secret-cron-token-12345" \
  -d '{"targetDate": "2026-09-07", "forceRun": true, "skipEmail": false}'
```

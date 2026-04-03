# Audit Feedback System

Production-ready audit feedback web app built with Next.js, Tailwind CSS, Supabase, and Recharts.

## Features
- Anonymous, mobile-first store feedback flow
- Public store selection with no sign-in required
- Shared-passcode protected analytics dashboard
- Manager-configurable 1-10 rating questions from the dashboard
- Daily precomputed metrics via Supabase Postgres function and `store_metrics`
- CSV export for aggregate metrics and raw anonymous feedback
- Dark mode and installable PWA shell

## Stack
- Next.js App Router
- Tailwind CSS
- Supabase JS client
- Recharts
- Zod

## Environment variables
Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DASHBOARD_PASSCODE=change-this-before-production
```

## Local development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup
- Run [`supabase/schema.sql`](./supabase/schema.sql)
- Run [`supabase/seed.sql`](./supabase/seed.sql)
- Review [`supabase/README.md`](./supabase/README.md)

## Production notes
- `SUPABASE_SERVICE_ROLE_KEY` is required because dashboard reads and CSV exports are server-only.
- The shared passcode gate is app-level protection, not per-user authentication.
- `store_metrics` should be the default source for analytics reads.
- Public feedback submits through the Supabase `submit_feedback` RPC so feedback, ratings, and metrics update in one transaction.

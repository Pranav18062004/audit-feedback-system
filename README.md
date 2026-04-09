# Audit Feedback System

Production-ready audit feedback web app built with Next.js, Tailwind CSS, Supabase, and Recharts.

## Features
- Supabase Auth Google sign-in
- Approved-email access control with admin and user roles
- Mobile-first store feedback flow for signed-in users
- Shared-passcode protected analytics dashboard for admins
- Manager-configurable 1-10 rating questions from the dashboard
- Admin-managed approved user email list
- Daily precomputed metrics via Supabase Postgres function and `store_metrics`
- CSV export for aggregate metrics and raw feedback including submitter email
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
- In Supabase Auth, enable the Google provider and add your local and production callback URLs:
  - `http://localhost:3000/auth/callback`
  - your deployed `https://.../auth/callback`
- Insert your first admin email into `public.allowed_users`
- Review [`supabase/README.md`](./supabase/README.md)

## Production notes
- `SUPABASE_SERVICE_ROLE_KEY` is required because dashboard reads and CSV exports are server-only.
- Supabase Auth handles user authentication; the shared passcode is an extra admin-only dashboard lock.
- `store_metrics` should be the default source for analytics reads.
- Feedback submits through the Supabase `submit_feedback` RPC so feedback, ratings, email traceability, and metrics update in one transaction.

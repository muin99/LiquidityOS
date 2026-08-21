# liquidity-frontend

The login, registration, and dashboard screens for Liquidity Lite. Pure
frontend — no backend calls yet, everything runs on mock data and local
component state so it's easy to click through on its own.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Pages

- `/` — landing page
- `/login` — log in (demo mode: pick a role, no real account needed)
- `/register` — sign up as an agent or coordinator
- `/dashboard/[role]` — a dynamic route; `/dashboard/agent`,
  `/dashboard/coordinator`, and `/dashboard/admin` all use the same
  page file, which reads the role straight out of the URL

## What's where

- `app/` — one folder per route (App Router)
- `components/` — one file per dashboard, plus the shared navbar
- `lib/` — `validation.ts` (zod schemas), `mock-data.ts` (fake data
  the dashboards display), `roles.ts` (the three role names)

## Stack

Next.js (App Router) · Tailwind CSS · DaisyUI · zod

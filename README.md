# KookGenie

**Cook Smart. Live Healthy.** — Demo Next.js app: landing page, full app shell, mock data, and OpenAI-powered APIs with graceful fallbacks.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- API routes for chat, recipe generation, and meal planning (`openai` SDK)
- Supabase client stub when env vars are absent
- Recharts for health progress charts

## Setup

```bash
cd kookgenie
npm install
cp .env.example .env.local
```

Add `OPENAI_API_KEY` and optional `NEXT_PUBLIC_SUPABASE_*` values in `.env.local`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page; `/home` opens the app.

## Deploy (Vercel)

Connect the repo, set the same environment variables, and deploy. Demo behavior works without keys.

# Supabase setup for KookGenie

This document matches the code in this repo: **Next.js App Router**, **`@supabase/ssr`**, **cookie-based sessions**, and **Row Level Security** on all user data tables.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Choose a region close to you (latency matters for mobile).
3. Save the database password.

## 2. Apply the database schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste and run, in order:
   - `supabase/migrations/20260211000000_initial_schema.sql`
   - `supabase/migrations/20260211120000_user_daily_goals.sql` (daily calorie & macro targets for the tracker UI)
   - `supabase/migrations/20260212000000_health_water_goal.sql` (daily water goal `ml` on `public.users`)
   - `supabase/migrations/20260215120000_ai_cache.sql` (shared `ai_cache` table for Gemini response caching + RLS)

What this does:

- Creates **`public.users`** (profile row per `auth.users` user).
- Creates **`food_logs`**, **`water_logs`**, **`weight_logs`**, **`recipes`**, **`favorites`**.
- Enables **RLS** and policies so users only read/write their own rows (recipes are read-only for all signed-in users).
- Adds a trigger **`handle_new_user`** so a `public.users` row is created when someone signs up.
- Adds tables to **`supabase_realtime`** where supported (wrapped in a safe `DO` block for idempotency).

## 3. Configure Auth URLs

1. **Authentication → URL configuration**
   - **Site URL**: `http://localhost:3000` for local dev; add your Vercel URL for production (e.g. `https://your-app.vercel.app`).
2. **Redirect URLs** (allowlist), add:

   - `http://localhost:3000/**`
   - `https://YOUR_PRODUCTION_DOMAIN/**`

   The magic link must be allowed to redirect to `/auth/callback`.

## 4. Enable email (magic link)

1. **Authentication → Providers → Email** — enable.
2. For production, configure SMTP or use Supabase’s default (with rate limits).

## 5. Environment variables

Copy `.env.local.example` to `.env.local` and fill:

| Variable | Where to find it |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |

**Never** put the **service role** key in `NEXT_PUBLIC_*` or ship it to the browser. Normal app traffic should use the **anon** key + RLS.

On **Vercel**: Project → Settings → Environment Variables — add the same `NEXT_PUBLIC_*` variables for Production (and Preview if needed).

## 6. How auth works in this app

1. **`middleware.ts`** calls `updateSession` so the auth cookie stays fresh on navigations.
2. **`lib/supabase/server.ts`** builds a server client that reads/writes cookies (Server Components + Route Handlers).
3. **`lib/supabase/client.ts`** builds the browser client for `/login` (magic link) and client hooks.
4. **`/auth/callback`** exchanges the `code` from the email link for a session and redirects to `/profile` (or `next` query param).

## 7. Food logging API (backend)

Authenticated routes (session cookie):

- **`GET /api/food-logs`** — optional query `from`, `to` (ISO timestamps), `limit`.
- **`POST /api/food-logs`** — JSON body: `food_name`, `calories`, `protein`, `carbs`, `fat`, `quantity`, `meal_type` (`breakfast` | `lunch` | `dinner` | `snack`).
- **`PATCH /api/food-logs/[id]`** — partial update.
- **`DELETE /api/food-logs/[id]`** — delete own row.

All operations are enforced again by **RLS** in Postgres.

## 8. Realtime

After the migration, **`food_logs`** (and other log tables) are in the `supabase_realtime` publication. The hook **`useFoodLogs`** subscribes to changes for the signed-in user and refetches.

## 9. Next steps (separate modules)

- Full **calorie tracker UI** (meal sections, rings, modals).
- **PWA** manifest + service worker.
- **Gemini** only behind dedicated API routes for parsing/suggestions — not for storing logs or computing totals.

## 10. TypeScript types

`types/database.ts` mirrors the schema. After large schema changes, regenerate types with the Supabase CLI:

```bash
npx supabase gen types typescript --project-id YOUR_REF > types/database.ts
```

(Adjust workflow if you use linked local projects.)

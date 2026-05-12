-- Step 4: public read on global nutrition catalog (fixes empty /api/foods/search when anon or RLS is too tight).
-- Safe to re-run: drop + recreate policy by name.

alter table public.food_database enable row level security;

drop policy if exists "public food read" on public.food_database;

create policy "public food read"
  on public.food_database
  for select
  using (true);

-- Ensure PostgREST roles can read (idempotent grants).
grant select on table public.food_database to anon, authenticated;

-- KookGenie initial schema: profiles, logs, recipes, favorites + RLS + realtime
-- Run via Supabase SQL Editor or: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- public.users: 1:1 profile extension of auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  age int,
  gender text,
  height numeric(6, 2),
  weight numeric(6, 2),
  target_weight numeric(6, 2),
  activity_level text,
  goal text,
  created_at timestamptz not null default now()
);

create index if not exists users_created_at_idx on public.users (created_at desc);

-- ---------------------------------------------------------------------------
-- food_logs
-- ---------------------------------------------------------------------------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_name text not null,
  calories int not null check (calories >= 0),
  protein numeric(8, 2) not null default 0 check (protein >= 0),
  carbs numeric(8, 2) not null default 0 check (carbs >= 0),
  fat numeric(8, 2) not null default 0 check (fat >= 0),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  meal_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists food_logs_user_time_idx on public.food_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- water_logs
-- ---------------------------------------------------------------------------
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml int not null check (amount_ml > 0),
  created_at timestamptz not null default now()
);

create index if not exists water_logs_user_time_idx on public.water_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- weight_logs
-- ---------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight numeric(6, 2) not null check (weight > 0),
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_user_time_idx on public.weight_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- recipes (global library)
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cuisine text,
  calories int not null default 0 check (calories >= 0),
  protein numeric(8, 2) not null default 0 check (protein >= 0),
  carbs numeric(8, 2) not null default 0 check (carbs >= 0),
  fat numeric(8, 2) not null default 0 check (fat >= 0),
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  image text,
  created_at timestamptz not null default now()
);

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  unique (user_id, recipe_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.food_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.recipes enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "food_logs_select_own" on public.food_logs;
create policy "food_logs_select_own"
on public.food_logs for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "food_logs_insert_own" on public.food_logs;
create policy "food_logs_insert_own"
on public.food_logs for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "food_logs_update_own" on public.food_logs;
create policy "food_logs_update_own"
on public.food_logs for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "food_logs_delete_own" on public.food_logs;
create policy "food_logs_delete_own"
on public.food_logs for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "water_logs_select_own" on public.water_logs;
create policy "water_logs_select_own"
on public.water_logs for select to authenticated
using (user_id = auth.uid());

drop policy if exists "water_logs_insert_own" on public.water_logs;
create policy "water_logs_insert_own"
on public.water_logs for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "water_logs_update_own" on public.water_logs;
create policy "water_logs_update_own"
on public.water_logs for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "water_logs_delete_own" on public.water_logs;
create policy "water_logs_delete_own"
on public.water_logs for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "weight_logs_select_own" on public.weight_logs;
create policy "weight_logs_select_own"
on public.weight_logs for select to authenticated
using (user_id = auth.uid());

drop policy if exists "weight_logs_insert_own" on public.weight_logs;
create policy "weight_logs_insert_own"
on public.weight_logs for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "weight_logs_update_own" on public.weight_logs;
create policy "weight_logs_update_own"
on public.weight_logs for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "weight_logs_delete_own" on public.weight_logs;
create policy "weight_logs_delete_own"
on public.weight_logs for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "recipes_select_auth" on public.recipes;
create policy "recipes_select_auth"
on public.recipes for select
to authenticated
using (true);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites for select to authenticated
using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites for delete to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Realtime (idempotent: ignore if already in publication)
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.food_logs;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.water_logs;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.weight_logs;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.favorites;
  exception when duplicate_object then null;
  end;
end $$;

-- Nutrition engine bootstrap / repair (fixes PGRST205 when migrations were never applied on a project).
-- Safe on existing projects: CREATE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS + idempotent policies.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- food_database (global nutrition reference)
-- ---------------------------------------------------------------------------
create table if not exists public.food_database (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  serving_size text not null default '100 g',
  serving_unit text,
  reference_amount numeric(12, 4) not null default 100 check (reference_amount > 0),
  reference_unit text not null default 'g',
  calories numeric(12, 2) not null default 0 check (calories >= 0),
  protein numeric(12, 4) not null default 0 check (protein >= 0),
  carbs numeric(12, 4) not null default 0 check (carbs >= 0),
  fat numeric(12, 4) not null default 0 check (fat >= 0),
  fiber numeric(12, 4),
  sugar numeric(12, 4),
  sodium numeric(12, 4),
  external_food_id text,
  normalized_name text,
  category text,
  aliases text[] not null default '{}',
  verified boolean not null default true,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

alter table public.food_database add column if not exists brand text;
alter table public.food_database add column if not exists serving_unit text;
alter table public.food_database add column if not exists external_food_id text;
alter table public.food_database add column if not exists normalized_name text;
alter table public.food_database add column if not exists sugar numeric(12, 4);
alter table public.food_database add column if not exists sodium numeric(12, 4);
alter table public.food_database add column if not exists source text;

update public.food_database set source = 'manual' where source is null;
alter table public.food_database alter column source set default 'manual';

update public.food_database
set normalized_name = coalesce(nullif(trim(normalized_name), ''), lower(regexp_replace(trim(name), '\s+', ' ', 'g')))
where normalized_name is null or trim(normalized_name) = '';

alter table public.food_database alter column normalized_name set default '';
update public.food_database set normalized_name = '' where normalized_name is null;
alter table public.food_database alter column normalized_name set not null;

update public.food_database set serving_unit = reference_unit where serving_unit is null;

alter table public.food_database drop constraint if exists food_database_reference_unit_check;
alter table public.food_database
  add constraint food_database_reference_unit_check
  check (reference_unit in ('g', 'serving', 'piece', 'cup', 'ml'));

create index if not exists food_database_name_lower_idx on public.food_database (lower(name));
create index if not exists food_database_category_idx on public.food_database (category);
create index if not exists food_database_name_trgm_idx on public.food_database using gin (name gin_trgm_ops);
create index if not exists food_database_aliases_gin_idx on public.food_database using gin (aliases);
create index if not exists food_database_normalized_lower_idx on public.food_database (lower(normalized_name));
create index if not exists food_database_normalized_trgm_idx on public.food_database using gin (normalized_name gin_trgm_ops);
create index if not exists food_database_external_idx on public.food_database (source, external_food_id);

create unique index if not exists food_database_usda_fdc_unique
  on public.food_database (external_food_id)
  where source = 'usda' and external_food_id is not null;

create unique index if not exists food_database_openfoodfacts_code_unique
  on public.food_database (external_food_id)
  where source = 'openfoodfacts' and external_food_id is not null;

create or replace function public.search_food_database(search text, lim int default 20)
returns setof public.food_database
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.food_database
  where
    length(trim(search)) >= 1
    and (
      name ilike '%' || trim(search) || '%'
      or normalized_name ilike '%' || trim(search) || '%'
      or exists (
        select 1 from unnest(aliases) a
        where a ilike '%' || trim(search) || '%'
      )
      or similarity(name, trim(search)) > 0.15
      or similarity(normalized_name, trim(lower(search))) > 0.15
    )
  order by
    case when lower(name) = lower(trim(search)) then 0
         when lower(normalized_name) = lower(trim(search)) then 0
         when lower(name) like lower(trim(search)) || '%' then 1
         when lower(normalized_name) like lower(trim(search)) || '%' then 1
         when lower(name) like '%' || lower(trim(search)) || '%' then 2
         else 3 end,
    similarity(name, trim(search)) desc nulls last,
    length(name) asc
  limit greatest(1, least(coalesce(lim, 20), 50));
$$;

grant execute on function public.search_food_database(text, int) to authenticated;

-- ---------------------------------------------------------------------------
-- food_favorites (per-user; replaces a separate "favorite_foods" table)
-- ---------------------------------------------------------------------------
create table if not exists public.food_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  food_id uuid not null references public.food_database (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

create index if not exists food_favorites_user_created_idx on public.food_favorites (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- recent_foods (optional server-side recent picker cache; app may use food_logs instead)
-- ---------------------------------------------------------------------------
create table if not exists public.recent_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_name text not null,
  calories int not null,
  protein numeric(12, 4) not null,
  carbs numeric(12, 4) not null,
  fat numeric(12, 4) not null,
  quantity numeric(12, 4) not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists recent_foods_user_created_idx on public.recent_foods (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- ai_nutrition_cache (structured AI nutrition snapshots; complements ai_cache JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_nutrition_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  query_normalized text not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, query_normalized)
);

create index if not exists ai_nutrition_cache_user_idx on public.ai_nutrition_cache (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.food_database enable row level security;
alter table public.food_favorites enable row level security;
alter table public.recent_foods enable row level security;
alter table public.ai_nutrition_cache enable row level security;

drop policy if exists "food_database_select_authenticated" on public.food_database;
create policy "food_database_select_authenticated"
  on public.food_database for select
  to authenticated
  using (true);

drop policy if exists "food_database_insert_unverified" on public.food_database;
drop policy if exists "food_database_insert_cache" on public.food_database;
create policy "food_database_insert_cache"
  on public.food_database for insert
  to authenticated
  with check (
    (verified = false)
    or (
      verified = true
      and source = 'usda'
      and external_food_id is not null
      and char_length(external_food_id) <= 32
    )
    or (
      verified = true
      and source = 'openfoodfacts'
      and external_food_id is not null
      and char_length(external_food_id) <= 32
    )
  );

drop policy if exists "food_favorites_select_own" on public.food_favorites;
create policy "food_favorites_select_own"
  on public.food_favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "food_favorites_insert_own" on public.food_favorites;
create policy "food_favorites_insert_own"
  on public.food_favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "food_favorites_delete_own" on public.food_favorites;
create policy "food_favorites_delete_own"
  on public.food_favorites for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "recent_foods_select_own" on public.recent_foods;
create policy "recent_foods_select_own"
  on public.recent_foods for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "recent_foods_insert_own" on public.recent_foods;
create policy "recent_foods_insert_own"
  on public.recent_foods for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "recent_foods_delete_own" on public.recent_foods;
create policy "recent_foods_delete_own"
  on public.recent_foods for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_nutrition_cache_select_own" on public.ai_nutrition_cache;
create policy "ai_nutrition_cache_select_own"
  on public.ai_nutrition_cache for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_nutrition_cache_upsert_own" on public.ai_nutrition_cache;
create policy "ai_nutrition_cache_upsert_own"
  on public.ai_nutrition_cache for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ai_nutrition_cache_update_own" on public.ai_nutrition_cache;
create policy "ai_nutrition_cache_update_own"
  on public.ai_nutrition_cache for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Starter foods (only when library is empty)
-- ---------------------------------------------------------------------------
insert into public.food_database (
  name, brand, serving_size, serving_unit, reference_amount, reference_unit,
  calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name
)
select v.*
from (
  values
    ('Cooked rice (white)', null, '100 g', 'g', 100::numeric, 'g', 130::numeric, 2.7::numeric, 28::numeric, 0.3::numeric, 0.4::numeric, null::numeric, null::numeric, 'grains', array['rice','chawal','steamed rice']::text[], true, 'manual', 'cooked rice (white)'),
    ('Rolled oats (dry)', null, '40 g', 'g', 40::numeric, 'g', 150::numeric, 5::numeric, 27::numeric, 3::numeric, 4::numeric, 1::numeric, null::numeric, 'grains', array['oats','oatmeal']::text[], true, 'manual', 'rolled oats (dry)'),
    ('Beef steak (lean)', null, '100 g', 'g', 100::numeric, 'g', 250::numeric, 26::numeric, 0::numeric, 15::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['beef','steak']::text[], true, 'manual', 'beef steak (lean)'),
    ('Apple (medium)', null, '1 medium (~182 g)', 'piece', 1::numeric, 'piece', 95::numeric, 0.5::numeric, 25::numeric, 0.3::numeric, 4.4::numeric, 19::numeric, null::numeric, 'fruit', array['apple','apples']::text[], true, 'manual', 'apple (medium)'),
    ('Dosa (plain)', null, '1 medium (~80 g)', 'piece', 1::numeric, 'piece', 187::numeric, 3.5::numeric, 26::numeric, 7.5::numeric, 1.2::numeric, null::numeric, null::numeric, 'indian', array['dosa','dosai']::text[], true, 'manual', 'dosa (plain)'),
    ('Idli (1 piece)', null, '1 idli (~40 g)', 'piece', 1::numeric, 'piece', 39::numeric, 1.3::numeric, 7::numeric, 0.2::numeric, 0.5::numeric, null::numeric, null::numeric, 'indian', array['idli','idlis']::text[], true, 'manual', 'idli (1 piece)'),
    ('Boiled egg', null, '1 large egg', 'piece', 1::numeric, 'piece', 78::numeric, 6.3::numeric, 0.6::numeric, 5.3::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['egg','anda']::text[], true, 'manual', 'boiled egg'),
    ('Chicken breast (grilled)', null, '100 g', 'g', 100::numeric, 'g', 165::numeric, 31::numeric, 0::numeric, 3.6::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['chicken breast','chicken']::text[], true, 'manual', 'chicken breast (grilled)'),
    ('Banana (medium)', null, '1 medium (~118 g)', 'piece', 1::numeric, 'piece', 105::numeric, 1.3::numeric, 27::numeric, 0.4::numeric, 3.1::numeric, null::numeric, null::numeric, 'fruit', array['banana']::text[], true, 'manual', 'banana (medium)'),
    ('Milk (whole)', null, '1 cup (244 ml)', 'cup', 1::numeric, 'cup', 150::numeric, 8::numeric, 12::numeric, 8::numeric, 0::numeric, 12::numeric, null::numeric, 'dairy', array['milk','doodh']::text[], true, 'manual', 'milk (whole)')
) as v(name, brand, serving_size, serving_unit, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name)
where not exists (select 1 from public.food_database limit 1);

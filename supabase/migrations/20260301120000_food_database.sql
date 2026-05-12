-- Global nutrition reference + user favorites. Read-heavy, authenticated SELECT.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- food_database: per-reference macros (e.g. per 100g or per 1 piece)
-- ---------------------------------------------------------------------------
create table if not exists public.food_database (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serving_size text not null default '100 g',
  reference_amount numeric(12, 4) not null default 100 check (reference_amount > 0),
  reference_unit text not null default 'g' check (reference_unit in ('g', 'serving', 'piece', 'cup')),
  calories numeric(12, 2) not null check (calories >= 0),
  protein numeric(12, 4) not null default 0 check (protein >= 0),
  carbs numeric(12, 4) not null default 0 check (carbs >= 0),
  fat numeric(12, 4) not null default 0 check (fat >= 0),
  fiber numeric(12, 4) default 0 check (fiber >= 0),
  category text,
  aliases text[] not null default '{}',
  verified boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists food_database_name_lower_idx on public.food_database (lower(name));
create index if not exists food_database_category_idx on public.food_database (category);
create index if not exists food_database_name_trgm_idx on public.food_database using gin (name gin_trgm_ops);
create index if not exists food_database_aliases_gin_idx on public.food_database using gin (aliases);

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
      or exists (
        select 1 from unnest(aliases) a
        where a ilike '%' || trim(search) || '%'
      )
      or similarity(name, trim(search)) > 0.15
    )
  order by
    case when lower(name) = lower(trim(search)) then 0
         when lower(name) like lower(trim(search)) || '%' then 1
         when lower(name) like '%' || lower(trim(search)) || '%' then 2
         else 3 end,
    similarity(name, trim(search)) desc nulls last,
    length(name) asc
  limit greatest(1, least(coalesce(lim, 20), 50));
$$;

grant execute on function public.search_food_database(text, int) to authenticated;

-- ---------------------------------------------------------------------------
-- food_favorites: quick access per user
-- ---------------------------------------------------------------------------
create table if not exists public.food_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  food_id uuid not null references public.food_database (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

create index if not exists food_favorites_user_created_idx on public.food_favorites (user_id, created_at desc);

alter table public.food_database enable row level security;
alter table public.food_favorites enable row level security;

create policy "food_database_select_authenticated"
  on public.food_database for select
  to authenticated
  using (true);

-- Allow inserting AI-cached rows (unverified only) from the app server on behalf of users.
create policy "food_database_insert_unverified"
  on public.food_database for insert
  to authenticated
  with check (verified = false);

create policy "food_favorites_select_own"
  on public.food_favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "food_favorites_insert_own"
  on public.food_favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "food_favorites_delete_own"
  on public.food_favorites for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed: Indian + common staples (approximate reference values; editable in DB)
-- ---------------------------------------------------------------------------
insert into public.food_database (name, serving_size, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, category, aliases, verified)
values
  ('Cooked rice (white)', '100 g', 100, 'g', 130, 2.7, 28, 0.3, 0.4, 'grains', array['rice','chawal','steamed rice'], true),
  ('Dosa (plain)', '1 medium (~80 g)', 1, 'piece', 187, 3.5, 26, 7.5, 1.2, 'indian', array['dosa','dosai'], true),
  ('Idli (1 piece)', '1 idli (~40 g)', 1, 'piece', 39, 1.3, 7, 0.2, 0.5, 'indian', array['idli','idlis'], true),
  ('Sambar (bowl)', '1 cup (~200 ml)', 1, 'cup', 120, 5.5, 18, 3.2, 4.0, 'indian', array['sambar'], true),
  ('Chapati / roti', '1 piece (~40 g)', 1, 'piece', 120, 3.4, 18, 3.7, 2.1, 'indian', array['chapati','roti','phulka'], true),
  ('Chicken biryani', '1 serving (~250 g)', 1, 'serving', 420, 22, 48, 16, 2.5, 'indian', array['biryani','chicken biryani'], true),
  ('Pongal', '1 serving (~200 g)', 1, 'serving', 320, 9, 45, 12, 2.0, 'indian', array['pongal','ven pongal'], true),
  ('Poha (flattened rice)', '1 serving (~150 g)', 1, 'serving', 270, 5, 48, 7, 3.0, 'indian', array['poha','aval'], true),
  ('Parotta', '1 piece (~70 g)', 1, 'piece', 260, 5, 32, 12, 1.5, 'indian', array['parotta','porotta'], true),
  ('Curd rice', '1 bowl (~200 g)', 1, 'serving', 220, 8, 38, 4, 0.8, 'indian', array['curd rice','thayir sadam'], true),
  ('Upma', '1 serving (~180 g)', 1, 'serving', 250, 6, 38, 8, 2.5, 'indian', array['upma'], true),
  ('Boiled egg', '1 large egg', 1, 'piece', 78, 6.3, 0.6, 5.3, 0, 'protein', array['egg','anda'], true),
  ('Chicken breast (grilled)', '100 g', 100, 'g', 165, 31, 0, 3.6, 0, 'protein', array['chicken breast','chicken'], true),
  ('Banana (medium)', '1 medium (~118 g)', 1, 'piece', 105, 1.3, 27, 0.4, 3.1, 'fruit', array['banana'], true),
  ('Milk (whole)', '1 cup (244 ml)', 1, 'cup', 150, 8, 12, 8, 0, 'dairy', array['milk','doodh'], true),
  ('Toor dal (cooked)', '1 cup (~200 g)', 1, 'cup', 200, 12, 32, 4, 8.0, 'indian', array['dal','lentil'], true),
  ('Paneer', '100 g', 100, 'g', 265, 18, 2, 20, 0, 'indian', array['paneer','cottage cheese india'], true);

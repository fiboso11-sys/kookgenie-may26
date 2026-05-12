-- Extend food_database for external nutrition APIs (USDA FDC cache) + search on normalized_name.

-- Allow ml as a reference unit (e.g. beverages).
alter table public.food_database drop constraint if exists food_database_reference_unit_check;
alter table public.food_database
  add constraint food_database_reference_unit_check
  check (reference_unit in ('g', 'serving', 'piece', 'cup', 'ml'));

alter table public.food_database add column if not exists external_food_id text;
alter table public.food_database add column if not exists normalized_name text;
alter table public.food_database add column if not exists serving_unit text;
alter table public.food_database add column if not exists sugar numeric(12, 4);
alter table public.food_database add column if not exists sodium numeric(12, 4);
alter table public.food_database add column if not exists source text;
update public.food_database set source = 'manual' where source is null;
alter table public.food_database alter column source set default 'manual';
alter table public.food_database alter column source set not null;

alter table public.food_database add column if not exists normalized_name text;
update public.food_database
set normalized_name = lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
where normalized_name is null;

alter table public.food_database add column if not exists serving_unit text;
update public.food_database set serving_unit = reference_unit where serving_unit is null;

alter table public.food_database alter column normalized_name set not null;

create index if not exists food_database_normalized_lower_idx on public.food_database (lower(normalized_name));
create index if not exists food_database_normalized_trgm_idx on public.food_database using gin (normalized_name gin_trgm_ops);
create index if not exists food_database_external_idx on public.food_database (source, external_food_id);

create unique index if not exists food_database_usda_fdc_unique
  on public.food_database (external_food_id)
  where source = 'usda' and external_food_id is not null;

-- Replace search function to include normalized_name + external id matching.
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

-- Broaden insert policy: AI unverified rows OR USDA cached official rows.
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
  );

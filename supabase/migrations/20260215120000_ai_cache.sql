-- AI response cache: shared by prompt hash + type to minimize external API calls.
-- RLS: any signed-in user may read/write (shared cache). Do not store secrets in prompts.

create table if not exists public.ai_cache (
  id uuid primary key default gen_random_uuid(),
  prompt_hash text not null,
  prompt text not null,
  response jsonb not null,
  type text not null,
  created_at timestamptz not null default now(),
  constraint ai_cache_type_check check (type in (
    'food_parse',
    'nutrition_chat',
    'meal_recommend',
    'nutrition_explain',
    'recipe_outline'
  ))
);

create unique index if not exists ai_cache_prompt_hash_type_uidx
  on public.ai_cache (prompt_hash, type);

create index if not exists ai_cache_type_created_idx
  on public.ai_cache (type, created_at desc);

alter table public.ai_cache enable row level security;

create policy "ai_cache_select_authenticated"
  on public.ai_cache for select
  to authenticated
  using (true);

create policy "ai_cache_insert_authenticated"
  on public.ai_cache for insert
  to authenticated
  with check (true);

-- Allow upsert updates for same hash+type (refresh stale responses if needed)
create policy "ai_cache_update_authenticated"
  on public.ai_cache for update
  to authenticated
  using (true)
  with check (true);

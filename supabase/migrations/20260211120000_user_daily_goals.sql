-- Daily nutrition targets (user-defined; no hardcoded app defaults)
alter table public.users
  add column if not exists daily_calorie_goal int check (daily_calorie_goal is null or daily_calorie_goal > 0);

alter table public.users
  add column if not exists daily_protein_goal_g numeric(8, 2) check (daily_protein_goal_g is null or daily_protein_goal_g > 0);

alter table public.users
  add column if not exists daily_carbs_goal_g numeric(8, 2) check (daily_carbs_goal_g is null or daily_carbs_goal_g > 0);

alter table public.users
  add column if not exists daily_fat_goal_g numeric(8, 2) check (daily_fat_goal_g is null or daily_fat_goal_g > 0);

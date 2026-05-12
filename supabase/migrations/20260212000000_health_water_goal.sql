-- Daily water target (ml); user-defined — used for hydration % and streaks
alter table public.users
  add column if not exists daily_water_goal_ml int check (daily_water_goal_ml is null or daily_water_goal_ml > 0);

import type { Database } from "@/types/database";

/** Narrow slices of `users` row updates for typed API handlers. */
export type UsersRowUpdate = Database["public"]["Tables"]["users"]["Update"];

export type DailyGoalsUsersUpdate = Pick<
  UsersRowUpdate,
  "daily_calorie_goal" | "daily_protein_goal_g" | "daily_carbs_goal_g" | "daily_fat_goal_g"
>;

export type HealthSettingsUsersUpdate = Pick<
  UsersRowUpdate,
  "daily_water_goal_ml" | "height" | "target_weight"
>;

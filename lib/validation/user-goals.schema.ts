import { z } from "zod";

/**
 * Daily macro targets — JSON API + HTML forms both coerce to numbers.
 * Defined inline so `z.infer` is `{ [key]: number }` (no helper indirection → no `unknown`).
 */
export const userDailyGoalsFormSchema = z.object({
  daily_calorie_goal: z.coerce.number().int().min(500).max(20000),
  daily_protein_goal_g: z.coerce.number().min(1).max(1000),
  daily_carbs_goal_g: z.coerce.number().min(1).max(2000),
  daily_fat_goal_g: z.coerce.number().min(1).max(1000),
});

export type UserDailyGoalsFormValues = z.infer<typeof userDailyGoalsFormSchema>;

/** Sensible defaults when the user has not set goals yet (numeric fields only). */
export const USER_DAILY_GOALS_DEFAULTS: UserDailyGoalsFormValues = {
  daily_calorie_goal: 2000,
  daily_protein_goal_g: 120,
  daily_carbs_goal_g: 220,
  daily_fat_goal_g: 65,
};

/** PATCH `/api/user/goals` — same schema as the client form payload. */
export const userDailyGoalsSchema = userDailyGoalsFormSchema;

type GoalsRow = {
  daily_calorie_goal: number | null;
  daily_protein_goal_g: number | null;
  daily_carbs_goal_g: number | null;
  daily_fat_goal_g: number | null;
};

/** Merge DB row with placeholder defaults for unset fields. */
export function userDailyGoalsDefaultsFromRow(row: GoalsRow | null): UserDailyGoalsFormValues {
  return {
    daily_calorie_goal: row?.daily_calorie_goal ?? USER_DAILY_GOALS_DEFAULTS.daily_calorie_goal,
    daily_protein_goal_g: row?.daily_protein_goal_g ?? USER_DAILY_GOALS_DEFAULTS.daily_protein_goal_g,
    daily_carbs_goal_g: row?.daily_carbs_goal_g ?? USER_DAILY_GOALS_DEFAULTS.daily_carbs_goal_g,
    daily_fat_goal_g: row?.daily_fat_goal_g ?? USER_DAILY_GOALS_DEFAULTS.daily_fat_goal_g,
  };
}

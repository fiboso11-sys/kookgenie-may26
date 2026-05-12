/**
 * Form / API payload types derived from Zod (single source of truth lives under `lib/validation/`).
 * Import from here when you want domain-shaped types without pulling schema implementations.
 */

export type { FoodLogFormValues } from "@/lib/validation/food-log.schema";
export type { UserDailyGoalsFormValues } from "@/lib/validation/user-goals.schema";
export type { WaterGoalFormValues } from "@/lib/validation/water-goal.schema";
export type { WeightEntryFormValues } from "@/lib/validation/weight-entry.schema";

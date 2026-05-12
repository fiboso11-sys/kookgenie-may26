/** Shared Zod form + API validation. Prefer `z.infer<typeof schema>` for React Hook Form generics. */

export {
  userDailyGoalsFormSchema,
  userDailyGoalsSchema,
  USER_DAILY_GOALS_DEFAULTS,
  userDailyGoalsDefaultsFromRow,
  type UserDailyGoalsFormValues,
} from "./user-goals.schema";
export { foodLogFormSchema, mealTypeSchema, type FoodLogFormValues } from "./food-log.schema";
export { coercedIntField, coercedNumberField, emptyToUndefined } from "./coerced-fields";
export { waterGoalFormSchema, type WaterGoalFormValues } from "./water-goal.schema";
export { weightEntryFormSchema, type WeightEntryFormValues } from "./weight-entry.schema";
export { waterCustomMlSchema, type WaterCustomMl } from "./water-custom.schema";

import { z } from "zod";

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);

/**
 * No `.refine()` on coerced numbers — Zod 3 + TS infer those outputs as `unknown`.
 * Use `.int()`, `.positive()`, `.min()`, `.max()` only so `z.infer` is a plain struct of primitives.
 */
export const foodLogFormSchema = z.object({
  food_name: z.string().trim().min(1, "Name is required").max(160),
  quantity: z.coerce.number().positive("Quantity must be positive").max(10_000),
  calories: z.coerce.number().int().min(0).max(30_000),
  protein: z.coerce.number().min(0).max(2000),
  carbs: z.coerce.number().min(0).max(2000),
  fat: z.coerce.number().min(0).max(2000),
  meal_type: mealTypeSchema,
});

export type FoodLogFormValues = z.infer<typeof foodLogFormSchema>;

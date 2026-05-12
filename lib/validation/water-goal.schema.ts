import { z } from "zod";

export const waterGoalFormSchema = z.object({
  daily_water_goal_ml: z.coerce.number().int().min(500).max(20000),
});

export type WaterGoalFormValues = z.infer<typeof waterGoalFormSchema>;

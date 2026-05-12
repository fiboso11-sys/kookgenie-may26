import { z } from "zod";

export const weightEntryFormSchema = z.object({
  weight_kg: z.coerce.number().min(0.1, "Weight must be greater than 0").max(500, "Weight must be at most 500 kg"),
});

export type WeightEntryFormValues = z.infer<typeof weightEntryFormSchema>;

import { z } from "zod";

/** One-off custom water entry (ml) from the Water screen quick input. */
export const waterCustomMlSchema = z.number().int().min(1).max(5000);

export type WaterCustomMl = z.infer<typeof waterCustomMlSchema>;

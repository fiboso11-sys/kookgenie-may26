import { z, type ZodType } from "zod";

/** Normalize empty HTML field values before coercion (optional pre-step for custom pipelines). */
export function emptyToUndefined(val: unknown): unknown {
  if (val === "" || val === null || val === undefined) return undefined;
  if (typeof val === "string" && val.trim() === "") return undefined;
  return val;
}

/**
 * Required whole number — avoid `.refine()` after `coerce` so object inference stays `number`, not `unknown`.
 */
export function coercedIntField(params: { label: string; min: number; max: number }): ZodType<number> {
  const { label, min, max } = params;
  return z.coerce
    .number({ invalid_type_error: `${label} is required` })
    .int({ message: `${label} must be a whole number` })
    .min(min, { message: `${label}: at least ${min}` })
    .max(max, { message: `${label}: at most ${max}` });
}

export function coercedNumberField(params: { label: string; min: number; max: number }): ZodType<number> {
  const { label, min, max } = params;
  return z.coerce
    .number({ invalid_type_error: `${label} is required` })
    .min(min, { message: `${label}: at least ${min}` })
    .max(max, { message: `${label}: at most ${max}` });
}

/**
 * Pass as the second argument to `register(...)` for `<input type="number" />` so values stay numeric,
 * matching `z.coerce.number()` form types. Kept as an untyped `as const` object so React Hook Form’s
 * field-specific `RegisterOptions` (including `deps`) stays satisfied for every field name.
 */
export const valueAsNumber = { valueAsNumber: true as const };

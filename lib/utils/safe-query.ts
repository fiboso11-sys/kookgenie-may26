/** Safe page size for Supabase `.limit()` — never NaN/undefined. */
export function clampPageLimit(value: number | undefined, fallback: number): number {
  const base = value == null || !Number.isFinite(value) || value <= 0 ? fallback : Math.floor(value);
  return Math.min(Math.max(base, 1), 500);
}

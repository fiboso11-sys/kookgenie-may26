/**
 * Canonical string for matching / dedupe (lowercase, single spaces).
 */
export function normalizeFoodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/['’]/g, "'");
}

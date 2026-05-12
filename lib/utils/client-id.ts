/** Client-only id for optimistic rows; avoids throwing when `crypto.randomUUID` is missing (non-secure contexts). */
export function randomClientId(prefix: string): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}:${crypto.randomUUID()}`;
    }
  } catch {
    /* ignore */
  }
  return `${prefix}:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

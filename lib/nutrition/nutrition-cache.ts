/**
 * In-process single-flight for remote nutrition fills (per Node instance).
 * For multi-instance production, add Redis/Upstash.
 */

const inflight = new Map<string, Promise<void>>();

export async function runDedupedNutritionRemoteFill(cacheKey: string, fn: () => Promise<void>): Promise<void> {
  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const p = fn().finally(() => {
    if (inflight.get(cacheKey) === p) inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, p);
  return p;
}

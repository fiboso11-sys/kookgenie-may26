/**
 * In-process rate limiter for AI routes (per user + endpoint).
 * For multi-instance production, replace with Redis/Upstash.
 */

const WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_MAX = 36;

type Bucket = { hits: number[] };

const store = new Map<string, Bucket>();

function prune(ts: number, arr: number[]) {
  const cutoff = ts - WINDOW_MS;
  return arr.filter((t) => t > cutoff);
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function checkAiRateLimit(
  userId: string,
  endpoint: string,
  maxPerWindow: number = DEFAULT_MAX,
): RateLimitResult {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = prune(now, bucket.hits);
  if (bucket.hits.length >= maxPerWindow) {
    const oldest = bucket.hits[0] ?? now;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true };
}

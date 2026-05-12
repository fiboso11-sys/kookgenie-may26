import type { FoodDatabaseRow } from "@/types/database";

const KEY = "kg-food-search-v1";
const MAX = 40;

type CacheEntry = FoodDatabaseRow & { cachedAt: number };

function read(): CacheEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const j = JSON.parse(raw) as CacheEntry[];
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

function write(entries: CacheEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function cacheFoodSearchResults(rows: FoodDatabaseRow[]) {
  const now = Date.now();
  const prev = read();
  const map = new Map<string, CacheEntry>();
  for (const e of prev) map.set(e.id, e);
  for (const r of rows) {
    map.set(r.id, { ...r, cachedAt: now });
  }
  const merged = [...map.values()].sort((a, b) => b.cachedAt - a.cachedAt);
  write(merged);
}

export function searchFoodSearchCache(query: string, limit: number): FoodDatabaseRow[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const out: FoodDatabaseRow[] = [];
  for (const e of read()) {
    const raw = e as FoodDatabaseRow & { food_name?: string | null };
    const n = ((raw.name && raw.name.trim()) || (raw.food_name && String(raw.food_name).trim()) || "").toLowerCase();
    const hit =
      n.includes(q) ||
      (e.aliases ?? []).some((a) => a.toLowerCase().includes(q));
    if (!hit) continue;
    const row = Object.fromEntries(
      Object.entries(e).filter(([k]) => k !== "cachedAt"),
    ) as FoodDatabaseRow;
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

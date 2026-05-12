import { isUndefinedColumnPostgrestError } from "@/lib/nutrition/merged-food-database-search";
import type { FoodDatabaseRow } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

function rowSortLabel(r: FoodDatabaseRow & { food_name?: string | null }) {
  return ((r.name && String(r.name).trim()) || (r.food_name && String(r.food_name).trim()) || "").toLowerCase();
}

/**
 * Strictly local `food_database` search (no RPC, no external calls).
 * Supports schemas with **`name`** or legacy **`food_name`** as the display column.
 */
export async function searchFoodDatabaseLocalOnly(
  supabase: ServerSupabaseClient,
  rawQuery: string,
  limit: number,
): Promise<FoodDatabaseRow[]> {
  const q = rawQuery.replace(/%/g, "").replace(/_/g, "").trim();
  if (q.length < 1) return [];
  const pat = `%${q}%`;
  const lim = Math.min(50, Math.max(1, limit));

  try {
    const map = new Map<string, FoodDatabaseRow>();

    let byLabel = await supabase.from("food_database").select("*").ilike("name", pat).limit(lim);
    if (byLabel.error && isUndefinedColumnPostgrestError(byLabel.error)) {
      byLabel = await supabase.from("food_database").select("*").ilike("food_name", pat).limit(lim);
    }
    if (byLabel.error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[kg/local-food-search]", byLabel.error);
      }
      return [];
    }
    for (const row of byLabel.data ?? []) map.set(row.id, row as FoodDatabaseRow);

    const byNorm = await supabase.from("food_database").select("*").ilike("normalized_name", pat).limit(lim);
    if (!byNorm.error) {
      for (const row of byNorm.data ?? []) map.set(row.id, row as FoodDatabaseRow);
    }

    return Array.from(map.values())
      .sort((a, b) => rowSortLabel(a).localeCompare(rowSortLabel(b)))
      .slice(0, lim);
  } catch {
    return [];
  }
}

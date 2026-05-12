import { isUndefinedColumnPostgrestError } from "@/lib/nutrition/merged-food-database-search";
import { normalizeFoodName } from "@/lib/nutrition/food-normalizer";
import type { FoodDatabaseRow } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

function rowSortLabel(r: FoodDatabaseRow & { food_name?: string | null }) {
  return ((r.name && String(r.name).trim()) || (r.food_name && String(r.food_name).trim()) || "").toLowerCase();
}

/**
 * When `search_food_database` RPC is missing (migrations not applied) or errors,
 * match on display name (or `food_name` when `name` column is absent) + optional `normalized_name`.
 */
async function fallbackSearchFoodDatabase(
  supabase: ServerSupabaseClient,
  query: string,
  limit: number,
): Promise<FoodDatabaseRow[]> {
  const safe = query.replace(/%/g, "").replace(/_/g, "").replace(/,/g, "").trim();
  if (safe.length < 1) return [];
  const pat = `%${safe}%`;
  const lim = Math.min(50, Math.max(1, limit));
  try {
    const map = new Map<string, FoodDatabaseRow>();

    let byLabel = await supabase.from("food_database").select("*").ilike("name", pat).limit(lim);
    if (byLabel.error && isUndefinedColumnPostgrestError(byLabel.error)) {
      byLabel = await supabase.from("food_database").select("*").ilike("food_name", pat).limit(lim);
    }
    if (byLabel.error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[kg/fallbackSearchFoodDatabase] label column", byLabel.error);
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
  } catch (e) {
    console.warn("[kg/fallbackSearchFoodDatabase]", e);
    return [];
  }
}

export async function rpcSearchFoodDatabase(
  supabase: ServerSupabaseClient,
  query: string,
  limit = 20,
): Promise<FoodDatabaseRow[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  const { data, error } = await supabase.rpc("search_food_database", {
    search: q,
    lim: limit,
  });

  if (error) {
    return await fallbackSearchFoodDatabase(supabase, q, limit);
  }

  return (data ?? []) as FoodDatabaseRow[];
}

export async function listFavoriteFoods(
  supabase: ServerSupabaseClient,
  userId: string,
  limit = 12,
): Promise<FoodDatabaseRow[]> {
  const { data: favs, error: favErr } = await supabase
    .from("food_favorites")
    .select("food_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (favErr) {
    if (process.env.NODE_ENV !== "production") console.warn("[kg/listFavoriteFoods] favorites", favErr);
    return [];
  }
  const ids = (favs ?? []).map((f) => f.food_id).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: foods, error: foodErr } = await supabase.from("food_database").select("*").in("id", ids);
  if (foodErr) {
    if (process.env.NODE_ENV !== "production") console.warn("[kg/listFavoriteFoods] foods", foodErr);
    return [];
  }

  const order = new Map(ids.map((id, i) => [id, i]));
  return ((foods ?? []) as FoodDatabaseRow[]).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function toggleFoodFavorite(
  supabase: ServerSupabaseClient,
  userId: string,
  foodId: string,
): Promise<"added" | "removed"> {
  const { data: existing, error: selErr } = await supabase
    .from("food_favorites")
    .select("food_id")
    .eq("user_id", userId)
    .eq("food_id", foodId)
    .maybeSingle();

  if (selErr) throw selErr;

  if (existing) {
    const { error: delErr } = await supabase.from("food_favorites").delete().eq("user_id", userId).eq("food_id", foodId);
    if (delErr) throw delErr;
    return "removed";
  }

  const { error: insErr } = await supabase.from("food_favorites").insert({ user_id: userId, food_id: foodId });
  if (insErr) throw insErr;
  return "added";
}

export async function insertAiFoodRow(
  supabase: ServerSupabaseClient,
  row: {
    name: string;
    brand?: string | null;
    serving_size: string;
    reference_amount: number;
    reference_unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number | null;
    category?: string | null;
    aliases?: string[];
    verified?: boolean;
  },
): Promise<FoodDatabaseRow> {
  const name = row.name.trim();
  const normalized_name = normalizeFoodName(name);
  const refUnit = row.reference_unit.trim();
  const { data, error } = await supabase
    .from("food_database")
    .insert({
      name,
      brand: row.brand ?? null,
      normalized_name,
      serving_size: row.serving_size,
      serving_unit: refUnit,
      reference_amount: row.reference_amount,
      reference_unit: refUnit,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
      fiber: row.fiber ?? 0,
      category: row.category ?? null,
      aliases: row.aliases ?? [],
      verified: row.verified ?? false,
      source: "ai",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as FoodDatabaseRow;
}

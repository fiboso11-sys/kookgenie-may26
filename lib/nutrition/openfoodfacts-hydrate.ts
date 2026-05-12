import { normalizeFoodName } from "@/lib/nutrition/food-normalizer";
import type { FoodDatabaseRow } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
const FETCH_TIMEOUT_MS = 12_000;
const MAX_INSERTS_PER_QUERY = 4;

type OffNutriments = Record<string, unknown>;

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: OffNutriments;
};

type OffSearchJson = {
  products?: OffProduct[];
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function pickKcal(n: OffNutriments): number | null {
  const kcal =
    num(n["energy-kcal_100g"]) ??
    num(n["energy-kcal"]) ??
    (() => {
      const kj = num(n["energy-kj_100g"]) ?? num(n["energy-kj"]);
      return kj != null ? kj / 4.184 : null;
    })();
  if (kcal == null) return null;
  return Math.round(Math.min(9000, Math.max(0, kcal)));
}

function pickSodiumMg(n: OffNutriments): number | null {
  const na = num(n["sodium_100g"]);
  if (na != null) return Math.round(Math.min(50_000, Math.max(0, na * 1000)));
  const salt = num(n["salt_100g"]);
  if (salt != null) return Math.round(Math.min(50_000, Math.max(0, salt * 400)));
  return null;
}

function macrosFromNutriments(nutriments: OffNutriments): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
} | null {
  const calories = pickKcal(nutriments);
  const protein = num(nutriments["proteins_100g"]);
  const carbs = num(nutriments["carbohydrates_100g"]);
  const fat = num(nutriments["fat_100g"]);
  if (calories == null || protein == null || carbs == null || fat == null) return null;

  const fiber = num(nutriments["fiber_100g"]);
  const sugar = num(nutriments["sugars_100g"]);
  const sodium = pickSodiumMg(nutriments);

  return {
    calories,
    protein: Math.round(Math.min(500, Math.max(0, protein)) * 10) / 10,
    carbs: Math.round(Math.min(500, Math.max(0, carbs)) * 10) / 10,
    fat: Math.round(Math.min(500, Math.max(0, fat)) * 10) / 10,
    fiber: fiber != null ? Math.round(Math.min(200, Math.max(0, fiber)) * 10) / 10 : null,
    sugar: sugar != null ? Math.round(Math.min(200, Math.max(0, sugar)) * 10) / 10 : null,
    sodium,
  };
}

async function fetchOffSearch(query: string): Promise<OffProduct[]> {
  const u = new URL(OFF_SEARCH);
  u.searchParams.set("search_terms", query.trim().slice(0, 120));
  u.searchParams.set("search_simple", "1");
  u.searchParams.set("action", "process");
  u.searchParams.set("json", "true");
  u.searchParams.set("page_size", "12");

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(u.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: ac.signal,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as OffSearchJson;
    return json.products ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/**
 * Inserts the first Open Food Facts hit with usable per-100g macros (when missing in DB).
 * Uses `verified = true` only when policy allows (server + matching RLS); otherwise callers should use service role.
 */
export async function cacheFirstOpenFoodFactsProduct(
  writer: ServerSupabaseClient,
  query: string,
): Promise<FoodDatabaseRow | null> {
  const q = query.trim();
  if (q.length < 2) return null;

  const products = await fetchOffSearch(q);
  const lim = Math.min(products.length, MAX_INSERTS_PER_QUERY);

  for (let i = 0; i < lim; i++) {
    const p = products[i]!;
    const code = p.code?.trim();
    const rawName = (p.product_name_en || p.product_name || "").trim().slice(0, 200);
    if (!code || rawName.length < 2) continue;

    const { data: existing, error: selErr } = await writer
      .from("food_database")
      .select("id")
      .eq("source", "openfoodfacts")
      .eq("external_food_id", code)
      .maybeSingle();

    if (selErr) continue;
    if (existing) continue;

    const nutriments = p.nutriments ?? {};
    const macros = macrosFromNutriments(nutriments as OffNutriments);
    if (!macros) continue;

    const name = rawName;
    const normalized_name = normalizeFoodName(name);
    const brand = (p.brands ?? "").split(",")[0]?.trim().slice(0, 120) || null;

    const { data: row, error: insErr } = await writer
      .from("food_database")
      .insert({
        external_food_id: code,
        name,
        brand,
        normalized_name,
        serving_size: "100 g",
        serving_unit: "g",
        reference_amount: 100,
        reference_unit: "g",
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        fiber: macros.fiber ?? 0,
        sugar: macros.sugar,
        sodium: macros.sodium,
        category: "openfoodfacts",
        aliases: [],
        verified: true,
        source: "openfoodfacts",
      })
      .select("*")
      .maybeSingle();

    if (insErr) {
      if (insErr.code === "23505" || insErr.message.includes("duplicate") || insErr.message.includes("unique")) {
        const { data: again } = await writer
          .from("food_database")
          .select("*")
          .eq("source", "openfoodfacts")
          .eq("external_food_id", code)
          .maybeSingle();
        if (again) return again as FoodDatabaseRow;
      }
      continue;
    }
    if (row) {
      return row as FoodDatabaseRow;
    }
  }

  return null;
}

/**
 * Best-effort bulk cache for search: adds several OFF products so the next RPC search is richer.
 */
export async function hydrateOpenFoodFactsLibrary(
  writer: ServerSupabaseClient,
  query: string,
  maxInserts: number,
): Promise<void> {
  const q = query.trim();
  if (q.length < 2 || maxInserts < 1) return;

  const products = await fetchOffSearch(q);
  let inserted = 0;

  for (const p of products) {
    if (inserted >= maxInserts) break;
    const code = p.code?.trim();
    const rawName = (p.product_name_en || p.product_name || "").trim().slice(0, 200);
    if (!code || rawName.length < 2) continue;

    const { data: existing, error: selErr } = await writer
      .from("food_database")
      .select("id")
      .eq("source", "openfoodfacts")
      .eq("external_food_id", code)
      .maybeSingle();

    if (selErr) continue;
    if (existing) continue;

    const nutriments = p.nutriments ?? {};
    const macros = macrosFromNutriments(nutriments as OffNutriments);
    if (!macros) continue;

    const name = rawName;
    const normalized_name = normalizeFoodName(name);
    const brand = (p.brands ?? "").split(",")[0]?.trim().slice(0, 120) || null;

    const { error: insErr } = await writer.from("food_database").insert({
      external_food_id: code,
      name,
      brand,
      normalized_name,
      serving_size: "100 g",
      serving_unit: "g",
      reference_amount: 100,
      reference_unit: "g",
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber ?? 0,
      sugar: macros.sugar,
      sodium: macros.sodium,
      category: "openfoodfacts",
      aliases: [],
      verified: true,
      source: "openfoodfacts",
    });

    if (!insErr) inserted += 1;
  }
}

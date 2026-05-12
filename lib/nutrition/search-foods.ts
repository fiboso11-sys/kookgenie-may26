import { searchFoodDatabaseLocalOnly } from "@/lib/nutrition/local-food-search";
import type { FoodDatabaseRow } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

/**
 * Local Supabase `food_database` only (emergency / offline-first mode).
 * No USDA, Open Food Facts, or Gemini.
 */
export async function searchFoodDatabaseForUser(
  supabase: ServerSupabaseClient,
  _userId: string,
  rawQuery: string,
  limit: number,
): Promise<FoodDatabaseRow[]> {
  try {
    return await searchFoodDatabaseLocalOnly(supabase, rawQuery, limit);
  } catch (e) {
    console.error("[kg/searchFoodDatabaseForUser]", e);
    return [];
  }
}

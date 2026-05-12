import { normalizeFoodName } from "@/lib/nutrition/food-normalizer";
import { searchFoodDatabaseForUser } from "@/lib/nutrition/search-foods";
import type { FoodDatabaseRow } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

export type ResolveFoodNutritionCode =
  | "OK_DATABASE"
  | "INVALID_INPUT"
  | "NO_MATCH"
  | "PICK_SUGGESTION";

export type ResolveFoodNutritionResponse =
  | {
      ok: true;
      code: "OK_DATABASE";
      row: FoodDatabaseRow;
      source: "database";
      suggestions: FoodDatabaseRow[];
    }
  | {
      ok: false;
      code: Exclude<ResolveFoodNutritionCode, "OK_DATABASE">;
      suggestions: FoodDatabaseRow[];
      message?: string;
    };

function pickFuzzySuggestion(name: string, suggestions: FoodDatabaseRow[]): FoodDatabaseRow | undefined {
  const nl = name.toLowerCase().trim();
  const nn = normalizeFoodName(name);
  for (const s of suggestions) {
    if (normalizeFoodName(s.name) === nn) return s;
    if (s.name.toLowerCase().trim() === nl) return s;
  }
  for (const s of suggestions) {
    const sl = s.name.toLowerCase();
    if (sl.includes(nl) || nl.includes(sl)) return s;
    for (const a of s.aliases ?? []) {
      const al = a.toLowerCase();
      if (al.includes(nl) || nl.includes(al)) return s;
    }
  }
  return undefined;
}

/**
 * Local `food_database` only — no AI, no external APIs.
 */
export async function resolveFoodNutritionForLogging(
  supabase: ServerSupabaseClient,
  userId: string,
  rawName: string,
): Promise<ResolveFoodNutritionResponse> {
  const name = rawName.trim();
  if (name.length < 2 || name.length > 160) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      suggestions: [],
      message: "Food name must be between 2 and 160 characters.",
    };
  }

  const suggestions = await searchFoodDatabaseForUser(supabase, userId, name, 12);
  const exact = suggestions.find((r) => r.name.toLowerCase() === name.toLowerCase());
  if (exact) {
    return { ok: true, code: "OK_DATABASE", row: exact, source: "database", suggestions };
  }

  const fuzzy = pickFuzzySuggestion(name, suggestions);
  if (fuzzy) {
    return { ok: true, code: "OK_DATABASE", row: fuzzy, source: "database", suggestions };
  }

  if (suggestions.length > 0) {
    return {
      ok: false,
      code: "PICK_SUGGESTION",
      suggestions,
      message: "Choose a match from the list — AI lookup is paused.",
    };
  }

  return {
    ok: false,
    code: "NO_MATCH",
    suggestions: [],
    message: "No library match yet. Try another spelling or add foods in Supabase.",
  };
}

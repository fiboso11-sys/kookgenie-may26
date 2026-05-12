import type { FoodLog } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";
import { searchFoodDatabaseForUser } from "@/lib/nutrition/search-foods";
import { generateGeminiJson } from "@/lib/ai/gemini-client";
import {
  FOOD_PARSE_SYSTEM,
  buildFoodParseUserPrompt,
} from "@/lib/ai/ai-prompts";
import { foodParseResponseSchema, type FoodParseResponse } from "@/lib/ai/schemas";

export type LocalFoodMatch = {
  source: "food_log" | "recipe" | "food_database";
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number;
  food_database_id?: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreMatch(query: string, name: string): number {
  const q = normalize(query);
  const n = normalize(name);
  if (!q || !n) return 0;
  if (n === q) return 100;
  if (n.includes(q) || q.includes(n)) return 80;
  const words = q.split(" ").filter((w) => w.length > 1);
  const hits = words.filter((w) => n.includes(w)).length;
  return (hits / Math.max(words.length, 1)) * 60;
}

/**
 * Database first: user's recent food_logs + global recipes (title match).
 */
export async function findLocalFoodMatches(
  supabase: ServerSupabaseClient,
  userId: string,
  query: string,
): Promise<LocalFoodMatch[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  let fromDb: LocalFoodMatch[] = [];
  try {
    const rows = await searchFoodDatabaseForUser(supabase, userId, q, 8);
    fromDb = rows.map((row) => ({
      source: "food_database" as const,
      food_name: row.name,
      calories: Math.round(Number(row.calories)),
      protein: Math.round(Number(row.protein) * 10) / 10,
      carbs: Math.round(Number(row.carbs) * 10) / 10,
      fat: Math.round(Number(row.fat) * 10) / 10,
      quantity: 1,
      food_database_id: row.id,
    }));
  } catch {
    fromDb = [];
  }

  const { data: logs, error: logErr } = await supabase
    .from("food_logs")
    .select("food_name, calories, protein, carbs, fat, quantity")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (logErr) {
    return fromDb.slice(0, 10);
  }

  const byName = new Map<
    string,
    { display: string; cal: number; p: number; c: number; f: number; n: number }
  >();
  for (const row of (logs ?? []) as Pick<FoodLog, "food_name" | "calories" | "protein" | "carbs" | "fat" | "quantity">[]) {
    const key = normalize(row.food_name);
    if (!key) continue;
    const cur = byName.get(key) ?? {
      display: row.food_name.trim(),
      cal: 0,
      p: 0,
      c: 0,
      f: 0,
      n: 0,
    };
    cur.cal += row.calories;
    cur.p += Number(row.protein);
    cur.c += Number(row.carbs);
    cur.f += Number(row.fat);
    cur.n += 1;
    byName.set(key, cur);
  }

  const fromLogs: LocalFoodMatch[] = [];
  for (const agg of byName.values()) {
    const c = Math.max(agg.n, 1);
    const sc = scoreMatch(q, agg.display);
    if (sc < 35) continue;
    fromLogs.push({
      source: "food_log",
      food_name: agg.display,
      calories: Math.round(agg.cal / c),
      protein: Math.round((agg.p / c) * 10) / 10,
      carbs: Math.round((agg.c / c) * 10) / 10,
      fat: Math.round((agg.f / c) * 10) / 10,
      quantity: 1,
    });
  }

  fromLogs.sort((a, b) => scoreMatch(q, b.food_name) - scoreMatch(q, a.food_name));

  const { data: recipes, error: recErr } = await supabase
    .from("recipes")
    .select("title, calories, protein, carbs, fat")
    .ilike("title", `%${q.replace(/%/g, "")}%`)
    .limit(12);

  if (recErr) {
    const mergedLogsOnly = [...fromDb.slice(0, 6), ...fromLogs.slice(0, 5)];
    mergedLogsOnly.sort((a, b) => {
      const boostA = a.source === "food_database" ? 8 : 0;
      const boostB = b.source === "food_database" ? 8 : 0;
      return scoreMatch(q, b.food_name) + boostB - (scoreMatch(q, a.food_name) + boostA);
    });
    return mergedLogsOnly.slice(0, 10);
  }

  const fromRecipes: LocalFoodMatch[] = (recipes ?? []).map((r) => ({
    source: "recipe" as const,
    food_name: r.title,
    calories: r.calories,
    protein: Number(r.protein),
    carbs: Number(r.carbs),
    fat: Number(r.fat),
  }));

  const merged = [...fromDb.slice(0, 6), ...fromLogs.slice(0, 5), ...fromRecipes.slice(0, 3)];
  merged.sort((a, b) => {
    const boostA = a.source === "food_database" ? 8 : 0;
    const boostB = b.source === "food_database" ? 8 : 0;
    return scoreMatch(q, b.food_name) + boostB - (scoreMatch(q, a.food_name) + boostA);
  });
  return merged.slice(0, 10);
}

export function formatLocalContext(matches: LocalFoodMatch[]): string {
  if (!matches.length) return "";
  return matches
    .map(
      (m) =>
        `- ${m.food_name} (~${m.calories} kcal, P${m.protein} C${m.carbs} F${m.fat}) [${m.source}]`,
    )
    .join("\n");
}

export async function parseFoodWithGemini(
  query: string,
  localMatches: LocalFoodMatch[],
): Promise<FoodParseResponse> {
  const localContext = formatLocalContext(localMatches);
  const userText = buildFoodParseUserPrompt(query, localContext);
  const raw = await generateGeminiJson({
    systemInstruction: FOOD_PARSE_SYSTEM,
    userText,
    temperature: 0.2,
  });
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model returned non-JSON");
  }
  const out = foodParseResponseSchema.safeParse(parsed);
  if (!out.success) {
    throw new Error("Model JSON failed validation");
  }
  return out.data;
}

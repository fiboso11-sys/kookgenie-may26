import type { FoodLog, FoodLogInsert } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";
import { clampPageLimit } from "@/lib/utils/safe-query";

export type Supabase = ServerSupabaseClient;

const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);

export function isValidMealType(value: string): value is "breakfast" | "lunch" | "dinner" | "snack" {
  return MEAL_TYPES.has(value);
}

export type ListFoodLogsParams = {
  from?: string;
  to?: string;
  limit?: number;
};

export async function listFoodLogs(
  supabase: Supabase,
  userId: string,
  { from, to, limit }: ListFoodLogsParams = {},
): Promise<FoodLog[]> {
  const pageSize = clampPageLimit(limit, 200);
  let q = supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (from) q = q.gte("created_at", from);
  if (to) q = q.lte("created_at", to);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FoodLog[];
}

export async function createFoodLog(
  supabase: Supabase,
  userId: string,
  input: Omit<FoodLogInsert, "user_id">,
): Promise<FoodLog> {
  const { data, error } = await supabase
    .from("food_logs")
    .insert({ ...input, user_id: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data as FoodLog;
}

export async function updateFoodLog(
  supabase: Supabase,
  userId: string,
  id: string,
  patch: Partial<Pick<FoodLog, "food_name" | "calories" | "protein" | "carbs" | "fat" | "quantity" | "meal_type">>,
): Promise<FoodLog> {
  const { data, error } = await supabase
    .from("food_logs")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as FoodLog;
}

export async function deleteFoodLog(supabase: Supabase, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("food_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

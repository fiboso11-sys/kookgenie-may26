import type { WaterLog } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";
import { clampPageLimit } from "@/lib/utils/safe-query";

export type Supabase = ServerSupabaseClient;

export async function listWaterLogs(
  supabase: Supabase,
  userId: string,
  opts: { from?: string; to?: string; limit?: number } = {},
): Promise<WaterLog[]> {
  const pageSize = clampPageLimit(opts.limit, 300);
  let q = supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(pageSize);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as WaterLog[];
}

export async function createWaterLog(supabase: Supabase, userId: string, amount_ml: number): Promise<WaterLog> {
  const { data, error } = await supabase
    .from("water_logs")
    .insert({ user_id: userId, amount_ml })
    .select("*")
    .single();
  if (error) throw error;
  return data as WaterLog;
}

export async function updateWaterLog(supabase: Supabase, userId: string, id: string, amount_ml: number): Promise<WaterLog> {
  const { data, error } = await supabase
    .from("water_logs")
    .update({ amount_ml })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as WaterLog;
}

export async function deleteWaterLog(supabase: Supabase, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("water_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

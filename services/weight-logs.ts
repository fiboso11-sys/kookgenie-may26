import type { WeightLog } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";
import { clampPageLimit } from "@/lib/utils/safe-query";

export type Supabase = ServerSupabaseClient;

export async function listWeightLogs(
  supabase: Supabase,
  userId: string,
  opts: { from?: string; to?: string; limit?: number } = {},
): Promise<WeightLog[]> {
  const pageSize = clampPageLimit(opts.limit, 200);
  let q = supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(pageSize);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as WeightLog[];
}

export async function createWeightLog(supabase: Supabase, userId: string, weight: number): Promise<WeightLog> {
  const { data, error } = await supabase
    .from("weight_logs")
    .insert({ user_id: userId, weight })
    .select("*")
    .single();
  if (error) throw error;
  return data as WeightLog;
}

export async function updateWeightLog(supabase: Supabase, userId: string, id: string, weight: number): Promise<WeightLog> {
  const { data, error } = await supabase
    .from("weight_logs")
    .update({ weight })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as WeightLog;
}

export async function deleteWeightLog(supabase: Supabase, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

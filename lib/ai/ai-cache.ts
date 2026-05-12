import { createHash } from "crypto";
import type { Json } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";

/** Alias for AI helpers; same as cookie session client from `createServerSupabaseClient`. */
export type AppSupabaseClient = ServerSupabaseClient;

export type AiCacheType =
  | "food_parse"
  | "nutrition_chat"
  | "meal_recommend"
  | "nutrition_explain"
  | "recipe_outline";

export function hashPrompt(type: AiCacheType, payload: string): string {
  const normalized = payload.replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256").update(`${type}:${normalized}`).digest("hex");
}

export async function getCachedJson(
  supabase: AppSupabaseClient,
  promptHash: string,
  type: AiCacheType,
): Promise<Json | null> {
  const { data, error } = await supabase
    .from("ai_cache")
    .select("response")
    .eq("prompt_hash", promptHash)
    .eq("type", type)
    .maybeSingle();

  if (error || !data) return null;
  return data.response;
}

export async function setCachedJson(
  supabase: AppSupabaseClient,
  params: {
    promptHash: string;
    prompt: string;
    type: AiCacheType;
    response: Json;
  },
): Promise<void> {
  const { error } = await supabase.from("ai_cache").upsert(
    {
      prompt_hash: params.promptHash,
      prompt: params.prompt.slice(0, 8000),
      response: params.response,
      type: params.type,
      created_at: new Date().toISOString(),
    },
    { onConflict: "prompt_hash,type" },
  );

  if (error) throw error;
}

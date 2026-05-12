import type { Json } from "@/types/database";

/**
 * Store structured objects in Supabase `json` / `jsonb` columns with a single,
 * explicit boundary cast (values are JSON-serializable).
 */
export function toJsonColumn(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

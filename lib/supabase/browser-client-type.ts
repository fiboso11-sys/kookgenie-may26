import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Single factory: type + runtime stay identical (no `as` casts). */
export function createTypedBrowserClient(url: string, anonKey: string) {
  return createBrowserClient<Database>(url, anonKey);
}

export type BrowserSupabaseClient = ReturnType<typeof createTypedBrowserClient>;

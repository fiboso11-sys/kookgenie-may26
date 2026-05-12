import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ServerSupabaseClient } from "@/lib/supabase/server-types";
import { getSupabaseServiceRoleKey, getSupabaseUrl, isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

let cached: ServerSupabaseClient | null = null;

/**
 * Supabase client with **service_role** privileges (bypasses RLS).
 * Use only for **trusted, server-only** operations — never import from client components.
 */
export function createServiceRoleSupabaseClient(): ServerSupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }) as ServerSupabaseClient;
}

/** Reuses one client per runtime (Node server / serverless warm instance). */
export function getOptionalServiceRoleSupabaseClient(): ServerSupabaseClient | null {
  if (!isSupabaseServiceRoleConfigured()) return null;
  if (!cached) cached = createServiceRoleSupabaseClient();
  return cached;
}

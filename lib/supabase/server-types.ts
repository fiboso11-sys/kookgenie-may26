import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type { BrowserSupabaseClient } from "@/lib/supabase/browser-client-type";

/**
 * Cookie/server routes need full `Database` table typings on `.update()` — keep `SupabaseClient<Database>`
 * (do not use `ReturnType<typeof createServerClient>`; it can collapse `.update()` to `never`).
 */
export type ServerSupabaseClient = SupabaseClient<Database>;

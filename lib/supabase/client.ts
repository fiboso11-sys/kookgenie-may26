import {
  createTypedBrowserClient,
  type BrowserSupabaseClient,
} from "@/lib/supabase/browser-client-type";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseEnvConfigured,
} from "@/lib/supabase/env";

let browserClient: BrowserSupabaseClient | null = null;

export type { BrowserSupabaseClient };

export function isSupabaseConfigured(): boolean {
  return isSupabaseEnvConfigured();
}

/**
 * Browser Supabase client with cookie session (required for SSR auth refresh).
 * Call only from Client Components.
 */
export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  if (!browserClient) {
    browserClient = createTypedBrowserClient(url, key);
  }
  return browserClient;
}

/** @deprecated Prefer createBrowserSupabaseClient for auth-aware sessions */
export function getSupabaseBrowserClient(): BrowserSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createBrowserSupabaseClient();
  } catch {
    return null;
  }
}

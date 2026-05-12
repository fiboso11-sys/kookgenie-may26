/**
 * Supabase dashboard may show either name for the public client key.
 * Prefer publishable (new); fall back to anon (legacy).
 */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseEnvConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

/**
 * Supabase **service_role** JWT (server-only). Bypasses RLS — never use in the browser or `NEXT_PUBLIC_*`.
 * Optional: enables trusted server writes (e.g. USDA nutrition cache) when anon policies are tight.
 */
export function getSupabaseServiceRoleKey(): string | undefined {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return k || undefined;
}

export function isSupabaseServiceRoleConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

/**
 * USDA FoodData Central API key (server-only). Never expose to the client.
 * @see https://fdc.nal.usda.gov/api-key-signup.html
 */
export function getUsdaFoodDataApiKey(): string | undefined {
  const k = process.env.USDA_FOODDATA_API_KEY?.trim();
  return k || undefined;
}

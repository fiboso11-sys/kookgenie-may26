import { createServerSupabaseClient } from "@/lib/supabaseClient";
import {
  mergedTableFoodDatabaseSearch,
  normalizeFoodDatabaseDisplayRows,
} from "@/lib/nutrition/merged-food-database-search";
import { getOptionalServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { rpcSearchFoodDatabase } from "@/services/food-database";

export const dynamic = "force-dynamic";

const SEARCH_LIMIT = 20;

/**
 * Food library search with layered fallbacks:
 * 1) Table `ilike` on name / normalized_name / food_name (session-aware client)
 * 2) `search_food_database` RPC (aliases + trigram when available)
 * 3) Same as (1)+(2) with **service role** if configured (bypasses RLS when remote policies differ)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  if (!query) {
    return Response.json({
      database: [],
      favorites: [],
      recent: [],
      error: null,
    });
  }

  try {
    const supabase = await createServerSupabaseClient();

    let merged = await mergedTableFoodDatabaseSearch(supabase, query, SEARCH_LIMIT);

    if (merged.length === 0) {
      merged = await rpcSearchFoodDatabase(supabase, query, SEARCH_LIMIT);
    }

    if (merged.length === 0) {
      const sr = getOptionalServiceRoleSupabaseClient();
      if (sr) {
        merged = await mergedTableFoodDatabaseSearch(sr, query, SEARCH_LIMIT);
        if (merged.length === 0) {
          merged = await rpcSearchFoodDatabase(sr, query, SEARCH_LIMIT);
        }
      }
    }

    return Response.json({
      database: normalizeFoodDatabaseDisplayRows(merged),
      favorites: [],
      recent: [],
      error: null,
    });
  } catch (e) {
    console.error("Food search error:", e);
    return Response.json({
      database: [],
      favorites: [],
      recent: [],
      error: null,
    });
  }
}

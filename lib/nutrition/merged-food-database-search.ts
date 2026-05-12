import type { Database, FoodDatabaseRow } from "@/types/database";

/** Postgres undefined_column / PostgREST — e.g. `food_database.name` missing (legacy `food_name` only). */
export function isUndefinedColumnPostgrestError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  return error?.code === "42703" || /\bdoes not exist\b/i.test(error?.message ?? "");
}

export function sanitizeFoodSearchToken(query: string) {
  return query
    .replace(/%/g, "")
    .replace(/_/g, "")
    .replace(/"/g, "")
    .replace(/\\/g, "")
    .replace(/,/g, "")
    .slice(0, 120);
}

/** Map `food_name` → `name` when the row only has legacy / import columns. */
export function normalizeFoodDatabaseDisplayRows(rows: unknown[] | null): FoodDatabaseRow[] {
  if (!rows?.length) return [];
  return rows.map((row) => {
    const r = row as FoodDatabaseRow & { food_name?: string | null };
    const displayName =
      (typeof r.name === "string" && r.name.trim()) ||
      (typeof r.food_name === "string" && r.food_name.trim()) ||
      "";
    return { ...r, name: displayName || r.name || "" };
  });
}

/** Row shape returned when awaiting a PostgREST filter builder. */
export type FoodDbQueryResult = { data: unknown; error: { message: string } | null };

/** Minimal client shape; `.limit()` yields a thenable builder, not a bare `Promise`. */
export type FoodDatabaseTableSearchClient = {
  from(table: "food_database"): {
    select(columns: string): {
      ilike(column: string, pattern: string): {
        limit(n: number): PromiseLike<FoodDbQueryResult>;
      };
    };
  };
};

/**
 * Table-only search: `name`, `normalized_name`, optional `food_name` (ignored if column missing).
 * Works with browser or server Supabase clients.
 */
export async function mergedTableFoodDatabaseSearch(
  supabase: FoodDatabaseTableSearchClient,
  rawQuery: string,
  limit: number,
): Promise<FoodDatabaseRow[]> {
  const safe = sanitizeFoodSearchToken(rawQuery.trim());
  if (safe.length < 1) return [];
  const pat = `%${safe}%`;
  const lim = Math.min(50, Math.max(1, limit));

  const byId = new Map<string, FoodDatabaseRow>();

  function addRows(rows: FoodDatabaseRow[] | null | undefined) {
    for (const row of rows ?? []) {
      if (byId.size >= lim) return;
      if (!byId.has(row.id)) byId.set(row.id, row);
    }
  }

  let primary = await supabase.from("food_database").select("*").ilike("name", pat).limit(lim);
  let usedFoodNameAsPrimary = false;
  if (primary.error && isUndefinedColumnPostgrestError(primary.error)) {
    primary = await supabase.from("food_database").select("*").ilike("food_name", pat).limit(lim);
    usedFoodNameAsPrimary = true;
  }
  if (primary.error) return [];

  addRows(primary.data as FoodDatabaseRow[]);

  const byNorm = await supabase
    .from("food_database")
    .select("*")
    .ilike("normalized_name", pat)
    .limit(lim);
  if (!byNorm.error) addRows(byNorm.data as FoodDatabaseRow[]);

  if (!usedFoodNameAsPrimary) {
    const byFoodName = await supabase
      .from("food_database")
      .select("*")
      .ilike("food_name", pat)
      .limit(lim);
    if (!byFoodName.error) addRows(byFoodName.data as FoodDatabaseRow[]);
  }

  return [...byId.values()].slice(0, lim);
}

type SearchFoodDatabaseArgs = Database["public"]["Functions"]["search_food_database"]["Args"];

/** Browser `rpc` generics differ from `Database`; narrow at the boundary. */
export async function rpcSearchFoodDatabaseBrowser(
  client: unknown,
  search: string,
  lim: number,
): Promise<FoodDatabaseRow[]> {
  const sb = client as {
    rpc: (
      fn: "search_food_database",
      args: SearchFoodDatabaseArgs,
    ) => Promise<{ data: FoodDatabaseRow[] | null; error: { message: string } | null }>;
  };
  const { data, error } = await sb.rpc("search_food_database", { search, lim });
  if (error || !data?.length) return [];
  return normalizeFoodDatabaseDisplayRows(data as unknown[]);
}

/**
 * Cheap read check: RLS mis-config, wrong project, or empty table.
 * Uses a head count request so it stays light.
 */
export async function probeFoodDatabaseAccess(client: unknown): Promise<{
  ok: boolean;
  message: string;
  approxCount: number;
}> {
  const sb = client as {
    from: (t: "food_database") => {
      select: (
        cols: string,
        opts?: { count: "exact"; head: boolean },
      ) => PromiseLike<{ error: { message: string } | null; count: number | null }>;
    };
  };
  const { error, count } = await sb.from("food_database").select("*", { count: "exact", head: true });
  if (error) return { ok: false, message: error.message, approxCount: 0 };
  return { ok: true, message: "", approxCount: count ?? 0 };
}

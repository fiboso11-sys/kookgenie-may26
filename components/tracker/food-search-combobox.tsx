"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodDatabaseRow, FoodLog } from "@/types/database";
import { cn } from "@/lib/utils";
import { KG_EMERGENCY_DISABLE_AI } from "@/lib/config/emergency-recovery";
import { cacheFoodSearchResults, searchFoodSearchCache } from "@/lib/offline/food-search-cache";
import { isOfflineQueuedMutateResponse, pwaMutateFetch } from "@/lib/offline/pwa-fetch";
import {
  mergedTableFoodDatabaseSearch,
  normalizeFoodDatabaseDisplayRows,
  probeFoodDatabaseAccess,
  rpcSearchFoodDatabaseBrowser,
} from "@/lib/nutrition/merged-food-database-search";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type RecentHit = {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
};

type SearchPayload = {
  database: FoodDatabaseRow[];
  favorites: FoodDatabaseRow[];
  recent: RecentHit[];
};

/** API normalizes to `name`; offline cache or legacy rows may only have `food_name`. */
export function foodDatabaseLabel(row: FoodDatabaseRow & { food_name?: string | null }) {
  return (
    (typeof row.name === "string" && row.name.trim()) ||
    (typeof row.food_name === "string" && row.food_name.trim()) ||
    "Food"
  );
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  recentFoodLogs?: FoodLog[];
  onSelectDatabaseFood: (row: FoodDatabaseRow) => void;
  onSelectRecentFood: (hit: RecentHit) => void;
  selectedFoodId?: string | null;
};

export function FoodSearchCombobox({
  value,
  onChange,
  onBlur,
  error,
  recentFoodLogs,
  onSelectDatabaseFood,
  onSelectRecentFood,
  selectedFoodId,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchPayload | null>(null);
  const [apiSearchError, setApiSearchError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRequestId = useRef(0);

  const clientRecent = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 1 || !recentFoodLogs?.length) return [] as RecentHit[];
    const seen = new Set<string>();
    const out: RecentHit[] = [];
    for (const log of recentFoodLogs) {
      const key = log.food_name.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      if (!key.includes(q) && !q.split(/\s+/).every((w) => w.length === 0 || key.includes(w))) continue;
      seen.add(key);
      out.push({
        food_name: log.food_name.trim(),
        calories: log.calories,
        protein: Number(log.protein),
        carbs: Number(log.carbs),
        fat: Number(log.fat),
        quantity: Number(log.quantity) || 1,
      });
      if (out.length >= 5) break;
    }
    return out;
  }, [recentFoodLogs, value]);

  const searchFoods = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setData({ database: [], favorites: [], recent: [] });
      setApiSearchError(null);
      return;
    }

    const myId = ++searchRequestId.current;
    setData(null);
    setLoading(true);
    setApiSearchError(null);

    try {
      const sb = getSupabaseBrowserClient();

      const clientRowsTask = sb
        ? (async (): Promise<FoodDatabaseRow[]> => {
            try {
              const local = await mergedTableFoodDatabaseSearch(sb, q, 24);
              const normalized = normalizeFoodDatabaseDisplayRows(local);
              if (normalized.length) return normalized;
              return await rpcSearchFoodDatabaseBrowser(sb, q, 24);
            } catch (e) {
              console.warn("[FoodSearchCombobox] direct Supabase search failed:", e);
              return [];
            }
          })()
        : Promise.resolve([] as FoodDatabaseRow[]);

      const apiTask = fetch(`/api/foods/search?q=${encodeURIComponent(q)}`, {
        credentials: "include",
        cache: "no-store",
      }).then(async (response) => {
        const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
        return { response, json };
      });

      const [fromClient, { response, json }] = await Promise.all([clientRowsTask, apiTask]);
      if (myId !== searchRequestId.current) return;

      if (process.env.NODE_ENV === "development") {
        console.log("SEARCH RESPONSE (api):", json, "SEARCH (client rows):", fromClient.length);
      }

      let database = Array.isArray(json?.database)
        ? (json.database as FoodDatabaseRow[])
        : Array.isArray(json?.foods)
          ? (json.foods as FoodDatabaseRow[])
          : Array.isArray((json?.data as SearchPayload | undefined)?.database)
            ? ((json?.data as SearchPayload).database as FoodDatabaseRow[])
            : [];

      const byId = new Map<string, FoodDatabaseRow>();
      for (const row of fromClient) byId.set(row.id, row);
      for (const row of database) byId.set(row.id, row);
      database = [...byId.values()].slice(0, 24);

      const favorites =
        response.ok && Array.isArray(json?.favorites)
          ? (json.favorites as FoodDatabaseRow[])
          : response.ok && Array.isArray((json?.data as SearchPayload | undefined)?.favorites)
            ? ((json?.data as SearchPayload).favorites as FoodDatabaseRow[])
            : [];

      const recent =
        response.ok && Array.isArray(json?.recent)
          ? (json.recent as RecentHit[])
          : response.ok && Array.isArray((json?.data as SearchPayload | undefined)?.recent)
            ? ((json?.data as SearchPayload).recent as RecentHit[])
            : [];

      if (database.length === 0) {
        const cached = searchFoodSearchCache(q, 12);
        if (cached.length) {
          setData({ database: cached, favorites: [], recent: [] });
          setApiSearchError(null);
          return;
        }

        let diagnostic = "";
        if (!response.ok) {
          diagnostic =
            (typeof json?.error === "string" && json.error) || `API search failed (${response.status}).`;
        }
        if (sb) {
          const probe = await probeFoodDatabaseAccess(sb);
          if (!probe.ok) {
            diagnostic = diagnostic
              ? `${diagnostic} Supabase: ${probe.message}`
              : `Cannot read food_database: ${probe.message}`;
          } else if (probe.approxCount === 0) {
            diagnostic = diagnostic
              ? `${diagnostic} Table count is 0 — apply migrations/seeds in Supabase.`
              : "food_database is empty (0 rows). Run SQL migrations / seed data in your Supabase project.";
          } else if (!diagnostic) {
            diagnostic = `No matches for “${q}”. (${probe.approxCount}+ foods in library — try another spelling.)`;
          }
        } else if (!diagnostic) {
          diagnostic =
            "Supabase env missing in the browser (NEXT_PUBLIC_SUPABASE_URL + publishable key). API also returned no rows.";
        }

        setApiSearchError(diagnostic || "No foods found.");
        setData({ database: [], favorites: [], recent: [] });
        return;
      }

      setData({
        database: database || [],
        favorites: favorites || [],
        recent: recent || [],
      });
      setApiSearchError(null);
      cacheFoodSearchResults(database);
    } catch (error) {
      if (myId !== searchRequestId.current) return;
      console.error("Food search failed:", error);
      const cached = searchFoodSearchCache(q, 12);
      setData(
        cached.length ? { database: cached, favorites: [], recent: [] } : { database: [], favorites: [], recent: [] },
      );
      setApiSearchError(error instanceof Error ? error.message : "Search failed");
    } finally {
      if (myId === searchRequestId.current) setLoading(false);
    }
  }, []);

  const runSearch = searchFoods;

  // Do not gate on `open`: closing the list (click outside) must not cancel debounced fetch,
  // or "egg" can finish with no request while the panel is opened again with stale empty state.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 1) {
      setData({ database: [], favorites: [], recent: [] });
      setApiSearchError(null);
      return;
    }
    const t = setTimeout(() => void runSearch(q), 130);
    return () => clearTimeout(t);
  }, [value, runSearch]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onLogsUpdated() {
      const q = value.trim();
      if (open && q.length >= 1) void runSearch(q);
    }
    window.addEventListener("kg-food-logs-updated", onLogsUpdated);
    return () => window.removeEventListener("kg-food-logs-updated", onLogsUpdated);
  }, [open, value, runSearch]);

  async function toggleFavorite(e: React.MouseEvent, row: FoodDatabaseRow) {
    e.stopPropagation();
    try {
      const res = await pwaMutateFetch("/api/foods/favorite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food_id: row.id }),
      });
      const j = (await res.json()) as { data?: { action?: string }; error?: string; queued?: boolean };
      if (isOfflineQueuedMutateResponse(res, j)) {
        toast.success("Favorite queued — will sync when you're online");
        return;
      }
      if (!res.ok) throw new Error(j.error ?? "Favorite failed");
      toast.success(j.data?.action === "added" ? "Saved to favorites" : "Removed from favorites");
      void runSearch(value.trim());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update favorite");
    }
  }

  const showPanel = open && value.trim().length >= 1;

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-sm font-medium text-kg-foreground" htmlFor={`${listId}-input`}>
        Food name
      </label>
      <input
        id={`${listId}-input`}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-autocomplete="list"
        className={cn(
          "mt-1 w-full min-h-11 rounded-xl border px-3 py-2 text-sm text-kg-foreground outline-none transition",
          error ? "border-red-400" : "border-kg-border bg-kg-input focus:border-kg-primary focus:ring-2 focus:ring-kg-primary/20",
        )}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(onBlur, 120);
        }}
        placeholder="Search rice, dosa, egg…"
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}

      <AnimatePresence>
        {showPanel ? (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 mt-1 max-h-[min(60vh,320px)] w-full overflow-y-auto rounded-2xl border border-kg-border bg-kg-elevated py-1 shadow-xl"
          >
            {loading ? <li className="px-3 py-2 text-xs text-kg-muted">Searching…</li> : null}

            {apiSearchError ? (
              <li className="mx-2 my-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                {apiSearchError}
              </li>
            ) : null}

            {(data?.favorites?.length ?? 0) > 0 ? (
              <>
                <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-kg-subtle">
                  Favorites
                </li>
                {data!.favorites.map((row) => (
                  <li key={`fav-${row.id}`} role="option" aria-selected={selectedFoodId === row.id} className="px-1">
                    <div
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left text-sm hover:bg-kg-surface",
                        selectedFoodId === row.id && "bg-kg-primary/10",
                      )}
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onChange(foodDatabaseLabel(row));
                          onSelectDatabaseFood(row);
                          setOpen(false);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-kg-foreground">{foodDatabaseLabel(row)}</span>
                        <span className="shrink-0 text-[11px] text-kg-muted">{Math.round(Number(row.calories))} kcal</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Toggle favorite"
                        className="shrink-0 rounded-lg px-1.5 py-1 text-kg-primary hover:bg-kg-surface"
                        onClick={(e) => void toggleFavorite(e, row)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        ★
                      </button>
                    </div>
                  </li>
                ))}
              </>
            ) : null}

            {(data?.database?.length ?? 0) > 0 ? (
              <>
                <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-kg-subtle">Library</li>
                {data!.database.map((row) => (
                  <li key={row.id} role="option" aria-selected={selectedFoodId === row.id} className="px-1">
                    <div
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left text-sm hover:bg-kg-surface",
                        selectedFoodId === row.id && "bg-kg-primary/10",
                      )}
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onChange(foodDatabaseLabel(row));
                          onSelectDatabaseFood(row);
                          setOpen(false);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-kg-foreground">{foodDatabaseLabel(row)}</span>
                        <span className="shrink-0 text-[11px] text-kg-muted">{Math.round(Number(row.calories))} kcal</span>
                      </button>
                      <button
                        type="button"
                        aria-label="Toggle favorite"
                        className="shrink-0 rounded-lg px-1.5 py-1 text-kg-muted hover:text-kg-primary"
                        onClick={(e) => void toggleFavorite(e, row)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        ☆
                      </button>
                    </div>
                  </li>
                ))}
              </>
            ) : null}

            {clientRecent.length > 0 ? (
              <>
                <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-kg-subtle">Recent</li>
                {clientRecent.map((r) => (
                  <li
                    key={r.food_name}
                    role="option"
                    aria-selected={value.trim().toLowerCase() === r.food_name.trim().toLowerCase()}
                    className="px-1"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-kg-surface"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange(r.food_name);
                        onSelectRecentFood(r);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate font-medium text-kg-foreground">{r.food_name}</span>
                      <span className="shrink-0 text-[11px] text-kg-muted">{r.calories} kcal</span>
                    </button>
                  </li>
                ))}
              </>
            ) : null}

            {(data?.recent?.length ?? 0) > 0 && clientRecent.length === 0 ? (
              <>
                <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-kg-subtle">Recent</li>
                {data!.recent.map((r) => (
                  <li
                    key={r.food_name}
                    role="option"
                    aria-selected={value.trim().toLowerCase() === r.food_name.trim().toLowerCase()}
                    className="px-1"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-kg-surface"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange(r.food_name);
                        onSelectRecentFood(r);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate font-medium text-kg-foreground">{r.food_name}</span>
                      <span className="shrink-0 text-[11px] text-kg-muted">{r.calories} kcal</span>
                    </button>
                  </li>
                ))}
              </>
            ) : null}

            {!loading &&
            data !== null &&
            (data.database?.length ?? 0) === 0 &&
            (data.favorites?.length ?? 0) === 0 &&
            clientRecent.length === 0 &&
            (data.recent?.length ?? 0) === 0 &&
            !apiSearchError ? (
              <li className="space-y-2 px-3 py-3">
                <p className="text-xs text-kg-muted">
                  {KG_EMERGENCY_DISABLE_AI
                    ? "No library matches yet — try another spelling or check your food list in Supabase."
                    : "No matches yet — try another spelling, or estimate below (library + USDA load first; AI is optional)."}
                </p>
                {KG_EMERGENCY_DISABLE_AI ? null : (
                  <AiEstimateButton
                    name={value.trim()}
                    onResolved={(row) => {
                      onChange(foodDatabaseLabel(row));
                      onSelectDatabaseFood(row);
                      setOpen(false);
                    }}
                  />
                )}
              </li>
            ) : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AiEstimateButton({ name, onResolved }: { name: string; onResolved: (row: FoodDatabaseRow) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy || name.length < 2}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await pwaMutateFetch("/api/ai/nutrition", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "resolve_food", name }),
          });
          const j = (await res.json().catch(() => ({}))) as {
            success?: boolean;
            fallback?: boolean;
            message?: string;
            data?: { row?: FoodDatabaseRow };
            error?: string;
            queued?: boolean;
          };
          if (isOfflineQueuedMutateResponse(res, j)) {
            throw new Error("You're offline — connect to the internet to estimate with AI.");
          }
          if (j.success === false && j.fallback) {
            toast.error(j.message ?? "AI temporarily unavailable — pick a food from the list or try again later.");
            return;
          }
          if (j.success && j.data?.row) {
            onResolved(j.data.row);
            toast.success("Nutrition estimated & saved for reuse");
            return;
          }
          if (!res.ok) throw new Error(j.error ?? "AI estimate failed");
          throw new Error(j.message ?? j.error ?? "No nutrition row returned. Pick a match from search.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "AI estimate failed");
        } finally {
          setBusy(false);
        }
      }}
      className="w-full rounded-xl bg-kg-secondary py-2.5 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
    >
      {busy ? "Estimating…" : "Estimate with AI"}
    </button>
  );
}

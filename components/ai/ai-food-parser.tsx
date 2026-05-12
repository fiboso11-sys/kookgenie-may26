"use client";

import { useCallback, useState } from "react";
import type { ParsedFoodItem } from "@/lib/ai/schemas";
import type { MealType } from "@/types/database";
import { toast } from "@/lib/toast";
import { AiFoodInput } from "@/components/ai/ai-food-input";
import { AiLoadingState } from "@/components/ai/ai-loading-state";
import { AiResultsCard } from "@/components/ai/ai-results-card";
import type { LocalFoodMatch } from "@/lib/ai/nutrition-parser";

type ParseResponse = {
  source: string;
  items?: ParsedFoodItem[];
  localMatches?: LocalFoodMatch[];
  message?: string;
};

type Props = {
  mealType: MealType;
  onApplyParsed: (item: ParsedFoodItem, meal: MealType) => void;
};

export function AiFoodParser({ mealType, onApplyParsed }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ParseResponse | null>(null);

  const runParse = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      toast.error("Enter a short food description first.");
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/ai/parse-food", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = (await res.json()) as ParseResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? res.statusText);
      setData(json);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-kg-neutral-800/65">
        Database matches load first on the server; Gemini runs only on demand and results are cached.
      </p>
      <AiFoodInput value={query} onChange={setQuery} disabled={loading} />
      <button
        type="button"
        disabled={loading}
        onClick={() => void runParse()}
        className="w-full rounded-xl bg-kg-secondary py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Parsing…" : "Parse with AI"}
      </button>

      {loading ? <AiLoadingState label="Parsing food…" /> : null}

      {data?.localMatches && data.localMatches.length > 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">From your log & recipes</p>
          <ul className="mt-2 space-y-1 text-xs text-emerald-950/90">
            {data.localMatches.slice(0, 6).map((m) => (
              <li key={`${m.source}-${m.food_name}`}>
                <button
                  type="button"
                  className="text-left underline decoration-emerald-600/40 underline-offset-2 hover:decoration-emerald-700"
                  onClick={() =>
                    onApplyParsed(
                      {
                        food_name: m.food_name,
                        calories: m.calories,
                        protein: m.protein,
                        carbs: m.carbs,
                        fat: m.fat,
                        quantity: m.quantity ?? 1,
                      },
                      mealType,
                    )
                  }
                >
                  {m.food_name} — {m.calories} kcal
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data?.items && data.items.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-kg-neutral-800/70">
            AI estimate{data.source === "cache" ? " (cached)" : ""}
          </p>
          <AiResultsCard items={data.items} mealType={mealType} onApply={onApplyParsed} />
        </div>
      ) : null}

      {data?.source === "ai_unavailable" && data.message ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">AI unavailable</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{data.message}</p>
          <p className="mt-2 text-xs text-kg-muted">Use library matches above, or retry after confirming GEMINI_API_KEY on the server.</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => void runParse()}
            className="mt-3 w-full rounded-lg border border-amber-300/80 bg-white/80 py-2 text-xs font-semibold text-amber-950 hover:bg-white disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-50"
          >
            Retry
          </button>
        </div>
      ) : data && data.source === "local_only" ? (
        <p className="text-sm text-kg-neutral-800/70">
          {data.message ??
            "No AI parse — use matches above. The server needs GEMINI_API_KEY in .env.local for Gemini."}
        </p>
      ) : null}
    </div>
  );
}

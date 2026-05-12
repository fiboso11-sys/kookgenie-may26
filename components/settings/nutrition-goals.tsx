"use client";

import { useTrackerGoals } from "@/hooks/use-tracker-goals";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { CalorieSummary } from "@/components/tracker/calorie-summary";
import { sumFoodLogs } from "@/lib/utils/nutrition";
import { useFoodLogs } from "@/hooks/use-food-logs";
import { startOfLocalDayISO, endOfLocalDayISO } from "@/lib/utils/date";
import { useMemo } from "react";

export function NutritionGoalsSettings() {
  const { user, supabase } = useSupabaseAuth();
  const { goals, loading, reloadGoals } = useTrackerGoals(Boolean(user));
  const now = useMemo(() => new Date(), []);
  const bounds = useMemo(
    () => ({ from: startOfLocalDayISO(now), to: endOfLocalDayISO(now) }),
    [now],
  );
  const { logs } = useFoodLogs(user?.id ?? null, supabase, bounds);
  const totals = useMemo(() => sumFoodLogs(logs), [logs]);

  if (!user) {
    return <p className="text-sm text-kg-muted">Sign in to edit nutrition targets.</p>;
  }

  return (
    <div className="kg-card p-5">
      <h2 className="text-sm font-semibold text-kg-secondary">Nutrition goals</h2>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">
        Daily calorie and macro targets (same editor as the calorie tracker).
      </p>
      <div className="mt-4">
        <CalorieSummary
          totals={totals}
          goals={goals}
          goalsLoading={loading}
          onGoalsSaved={reloadGoals}
          selectedDateLabel="Today"
        />
      </div>
    </div>
  );
}

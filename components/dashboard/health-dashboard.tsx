"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useFoodLogs } from "@/hooks/use-food-logs";
import { useWaterLogs } from "@/hooks/use-water-logs";
import { useWeightLogs } from "@/hooks/use-weight-logs";
import { useTrackerGoals } from "@/hooks/use-tracker-goals";
import { useHealthSettings } from "@/hooks/use-health-settings";
import { addLocalDays, endOfLocalDayISO, startOfLocalDayISO, toDateInputValue } from "@/lib/utils/date";
import { sumFoodLogs, groupLogsByMeal } from "@/lib/utils/nutrition";
import { totalWaterMlToday, latestWeight } from "@/lib/health-analytics";
import { activeDayKeysFromISOs, loggingStreakFromDays } from "@/lib/streaks";
import { DailyStreakCard } from "@/components/dashboard/daily-streak-card";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { AnalyticsCards } from "@/components/dashboard/analytics-cards";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { HealthScore } from "@/components/dashboard/health-score";

export function HealthDashboard() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth();
  const now = useMemo(() => new Date(), []);
  const range30 = useMemo(() => {
    const from = startOfLocalDayISO(addLocalDays(now, -30));
    const to = endOfLocalDayISO(now);
    return { from, to };
  }, [now]);
  const todayKey = toDateInputValue(now);

  const { logs: foodLogs, loading: fLoading } = useFoodLogs(user?.id ?? null, supabase, range30);
  const { logs: waterLogs, loading: wLoading } = useWaterLogs(user?.id ?? null, supabase, range30);
  const { logs: weightLogs, loading: wtLoading } = useWeightLogs(user?.id ?? null, supabase, range30);
  const { goals, loading: gLoading } = useTrackerGoals(Boolean(user));
  const { settings, loading: hLoading } = useHealthSettings(Boolean(user));

  const foodToday = useMemo(
    () => foodLogs.filter((l) => toDateInputValue(new Date(l.created_at)) === todayKey),
    [foodLogs, todayKey],
  );
  const totals = useMemo(() => sumFoodLogs(foodToday), [foodToday]);
  const meals = useMemo(() => groupLogsByMeal(foodToday), [foodToday]);
  const mealCount = meals.breakfast.length + meals.lunch.length + meals.dinner.length + meals.snack.length;

  const waterToday = totalWaterMlToday(waterLogs, todayKey);
  const lw = latestWeight(weightLogs);

  const foodStreak = useMemo(() => loggingStreakFromDays(activeDayKeysFromISOs(foodLogs.map((l) => l.created_at))), [foodLogs]);
  const waterStreak = useMemo(() => loggingStreakFromDays(activeDayKeysFromISOs(waterLogs.map((l) => l.created_at))), [waterLogs]);
  const weightStreak = useMemo(() => loggingStreakFromDays(activeDayKeysFromISOs(weightLogs.map((l) => l.created_at))), [weightLogs]);

  const calGoal = goals?.daily_calorie_goal ?? null;
  const calRem = calGoal != null ? Math.max(0, calGoal - totals.calories) : null;

  const calRatio = calGoal != null && calGoal > 0 ? totals.calories / calGoal : null;
  const waterRatio =
    settings?.daily_water_goal_ml != null && settings.daily_water_goal_ml > 0
      ? waterToday / settings.daily_water_goal_ml
      : null;
  const pGoal = goals?.daily_protein_goal_g ?? null;
  const pRatio = pGoal != null && pGoal > 0 ? totals.protein / pGoal : null;

  if (authLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />;
  }
  if (!user) {
    return (
      <div className="kg-card p-6">
        <p className="text-sm leading-relaxed text-kg-muted">Sign in for your health dashboard.</p>
        <Link href="/login" className="mt-3 inline-block text-sm font-semibold text-kg-primary hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const loading = fLoading || wLoading || wtLoading || gLoading || hLoading;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header>
        <h1 className="text-3xl font-bold text-kg-foreground">Health</h1>
        <p className="mt-1 text-sm leading-relaxed text-kg-muted">Live view of calories, water, weight, and streaks from Supabase.</p>
      </header>

      {loading && foodLogs.length === 0 && waterLogs.length === 0 ? (
        <div className="h-40 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <HealthScore
          parts={[
            { label: "Calories vs goal", value: calRatio },
            { label: "Water vs goal", value: waterRatio },
            { label: "Protein vs goal", value: pRatio },
          ]}
        />
        <ProgressOverview
          caloriesConsumed={totals.calories}
          calorieGoal={calGoal}
          waterMl={waterToday}
          waterGoal={settings?.daily_water_goal_ml ?? null}
          protein={totals.protein}
          proteinGoal={pGoal}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/food-logs"
          className="min-h-11 rounded-xl bg-kg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-kg-secondary"
        >
          Calories
        </Link>
        <Link
          href="/water"
          className="min-h-11 rounded-xl border border-kg-border bg-kg-elevated px-4 py-2 text-sm font-semibold text-kg-foreground hover:bg-kg-surface"
        >
          Water
        </Link>
        <Link
          href="/weight"
          className="min-h-11 rounded-xl border border-kg-border bg-kg-elevated px-4 py-2 text-sm font-semibold text-kg-foreground hover:bg-kg-surface"
        >
          Weight
        </Link>
      </div>

      <AnalyticsCards
        cards={[
          { title: "Calories left today", value: calRem != null ? `${calRem} kcal` : "—", hint: calGoal ? `Goal ${calGoal} kcal` : "Set calorie goal" },
          { title: "Water today", value: `${waterToday} ml`, hint: settings?.daily_water_goal_ml ? `Goal ${settings.daily_water_goal_ml} ml` : "Set water goal" },
          { title: "Latest weight", value: lw != null ? `${lw} kg` : "—", hint: settings?.target_weight ? `Target ${settings.target_weight} kg` : undefined },
          { title: "Meals logged today", value: String(mealCount), hint: "Entries across breakfast–snacks" },
        ]}
      />

      <DailyStreakCard foodStreak={foodStreak} waterStreak={waterStreak} weightStreak={weightStreak} />

      <WeeklySummary foodLogs={foodLogs} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, useOptimistic, startTransition } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import type { FoodLog } from "@/types/database";
import type { MealType } from "@/types/database";
import { useFoodLogs } from "@/hooks/use-food-logs";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useTrackerGoals } from "@/hooks/use-tracker-goals";
import { startOfLocalDayISO, endOfLocalDayISO, toDateInputValue, parseDateInputValue } from "@/lib/utils/date";
import { groupLogsByMeal, sumFoodLogs } from "@/lib/utils/nutrition";
import type { FoodLogFormValues } from "@/lib/validation/food-log.schema";
import { CalorieSummary } from "@/components/tracker/calorie-summary";
import { MacroRings } from "@/components/tracker/macro-rings";
import { MealSection } from "@/components/tracker/meal-section";
import { AddFoodModal } from "@/components/tracker/add-food-modal";
import { DeleteFoodDialog } from "@/components/tracker/delete-food-dialog";
import { TrackerSkeleton } from "@/components/tracker/tracker-skeleton";
import { NutritionAiDock } from "@/components/ai/nutrition-ai-dock";
import type { ParsedFoodItem } from "@/lib/ai/schemas";
import { pwaMutateFetch } from "@/lib/offline/pwa-fetch";
import { randomClientId } from "@/lib/utils/client-id";

type OptimisticAction =
  | { type: "add"; row: FoodLog }
  | { type: "delete"; id: string }
  | { type: "update"; row: FoodLog };

function mergeOptimistic(state: FoodLog[], action: OptimisticAction): FoodLog[] {
  switch (action.type) {
    case "add":
      return [action.row, ...state.filter((r) => r.id !== action.row.id)];
    case "delete":
      return state.filter((r) => r.id !== action.id);
    case "update":
      return state.map((r) => (r.id === action.row.id ? action.row : r));
    default:
      return state;
  }
}

function pendingFoodLog(userId: string, v: FoodLogFormValues): FoodLog {
  return {
    id: randomClientId("pending"),
    user_id: userId,
    food_name: v.food_name,
    calories: v.calories,
    protein: v.protein,
    carbs: v.carbs,
    fat: v.fat,
    quantity: v.quantity,
    meal_type: v.meal_type,
    created_at: new Date().toISOString(),
  };
}

export function CalorieDashboard() {
  const { user, loading: authLoading, supabase } = useSupabaseAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const bounds = useMemo(
    () => ({
      from: startOfLocalDayISO(selectedDate),
      to: endOfLocalDayISO(selectedDate),
    }),
    [selectedDate],
  );

  const { logs, loading, error, refetch } = useFoodLogs(user?.id ?? null, supabase, bounds);
  const { goals, loading: goalsLoading, reloadGoals } = useTrackerGoals(Boolean(user));

  useEffect(() => {
    const onSync = () => {
      void refetch();
      void reloadGoals();
    };
    window.addEventListener("kg-pwa-synced", onSync);
    return () => window.removeEventListener("kg-pwa-synced", onSync);
  }, [refetch, reloadGoals]);

  const [displayLogs, addOptimistic] = useOptimistic(logs, mergeOptimistic);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMeal, setModalMeal] = useState<MealType>("breakfast");
  const [editLog, setEditLog] = useState<FoodLog | null>(null);
  const [templateLog, setTemplateLog] = useState<FoodLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FoodLog | null>(null);

  const totals = useMemo(() => sumFoodLogs(displayLogs), [displayLogs]);
  const grouped = useMemo(() => groupLogsByMeal(displayLogs), [displayLogs]);

  const dateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate],
  );

  const openAdd = useCallback((meal: MealType, template?: FoodLog) => {
    setEditLog(null);
    setModalMeal(meal);
    setTemplateLog(template ?? null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((log: FoodLog) => {
    setEditLog(log);
    setTemplateLog(null);
    setModalMeal(log.meal_type as MealType);
    setModalOpen(true);
  }, []);

  const submitFood = useCallback(
    async (values: FoodLogFormValues, editId?: string) => {
      if (!user) return;
      if (editId) {
        const prev = logs.find((l) => l.id === editId);
        if (!prev) return;
        const optimistic: FoodLog = {
          ...prev,
          food_name: values.food_name,
          calories: values.calories,
          protein: values.protein,
          carbs: values.carbs,
          fat: values.fat,
          quantity: values.quantity,
          meal_type: values.meal_type,
        };
        startTransition(() => {
          addOptimistic({ type: "update", row: optimistic });
        });
        try {
          const res = await pwaMutateFetch(`/api/food-logs/${editId}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (res.status === 202) {
            toast.success("Update queued — will sync when you're online");
            return;
          }
          const json = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(json.error ?? res.statusText);
          await refetch();
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("kg-food-logs-updated"));
          toast.success("Food updated");
        } catch (e) {
          await refetch();
          toast.error(e instanceof Error ? e.message : "Update failed");
          throw e;
        }
      } else {
        const optimisticRow = pendingFoodLog(user.id, values);
        startTransition(() => {
          addOptimistic({ type: "add", row: optimisticRow });
        });
        try {
          const res = await pwaMutateFetch("/api/food-logs", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (res.status === 202) {
            toast.success("Meal queued — will sync when you're online");
            return;
          }
          const json = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(json.error ?? res.statusText);
          await refetch();
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("kg-food-logs-updated"));
          toast.success("Food logged");
        } catch (e) {
          await refetch();
          toast.error(e instanceof Error ? e.message : "Could not save");
          throw e;
        }
      }
    },
    [user, logs, addOptimistic, refetch],
  );

  const applyAiParsedFood = useCallback(
    (item: ParsedFoodItem, meal: MealType) => {
      if (!user) return;
      const template: FoodLog = {
        id: randomClientId("template"),
        user_id: user.id,
        food_name: item.food_name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        quantity: item.quantity ?? 1,
        meal_type: meal,
        created_at: new Date().toISOString(),
      };
      setEditLog(null);
      setTemplateLog(template);
      setModalMeal(meal);
      setModalOpen(true);
    },
    [user],
  );

  const performDelete = useCallback(
    async (log: FoodLog) => {
      startTransition(() => {
        addOptimistic({ type: "delete", id: log.id });
      });
      try {
        const res = await pwaMutateFetch(`/api/food-logs/${log.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 202) {
          toast.success("Delete queued — will sync when you're online");
          setDeleteTarget(null);
          return;
        }
        if (!res.ok && res.status !== 204) {
          const json = (await res.json()) as { error?: string };
          throw new Error(json.error ?? res.statusText);
        }
        await refetch();
        toast.success("Deleted");
        setDeleteTarget(null);
      } catch (e) {
        await refetch();
        toast.error(e instanceof Error ? e.message : "Delete failed");
      }
    },
    [addOptimistic, refetch],
  );

  if (authLoading) {
    return <TrackerSkeleton />;
  }

  if (!user) {
    return (
      <div className="kg-card mx-auto max-w-lg space-y-4 p-6">
        <h1 className="text-2xl font-bold text-kg-foreground">Calorie tracker</h1>
        <p className="text-sm leading-relaxed text-kg-muted">Sign in to log meals and sync with Supabase.</p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-xl bg-kg-primary px-4 text-sm font-semibold text-white hover:bg-kg-secondary"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-kg-neutral-800">Calorie tracker</h1>
          <p className="mt-1 text-sm text-kg-neutral-800/65">Real totals from your food log — synced with Supabase.</p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-kg-neutral-800/70">
          Day
          <input
            type="date"
            value={toDateInputValue(selectedDate)}
            onChange={(e) => setSelectedDate(parseDateInputValue(e.target.value))}
            className="min-h-11 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-kg-neutral-800"
          />
        </label>
      </header>

      {loading && logs.length === 0 ? (
        <TrackerSkeleton />
      ) : (
        <>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </p>
          ) : null}

          <CalorieSummary
            totals={totals}
            goals={goals}
            goalsLoading={goalsLoading}
            onGoalsSaved={reloadGoals}
            selectedDateLabel={dateLabel}
          />

          <MacroRings totals={totals} goals={goals} />

          <div className="space-y-4">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
              <MealSection
                key={meal}
                mealType={meal}
                logs={grouped[meal]}
                loading={loading}
                onAddFood={openAdd}
                onEdit={openEdit}
                onRequestDelete={setDeleteTarget}
                recentTemplates={displayLogs}
              />
            ))}
          </div>
        </>
      )}

      <AddFoodModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditLog(null);
          setTemplateLog(null);
        }}
        defaultMealType={modalMeal}
        editLog={editLog}
        template={templateLog}
        onSubmitEntry={submitFood}
        recentFoodLogs={displayLogs}
      />

      <DeleteFoodDialog
        log={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await performDelete(deleteTarget);
        }}
      />

      <NutritionAiDock
        totals={totals}
        goals={goals}
        mealType={modalMeal}
        onApplyParsedFood={applyAiParsedFood}
      />
    </div>
  );
}

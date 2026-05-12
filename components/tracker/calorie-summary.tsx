"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/lib/toast";
import type { MacroTotals } from "@/lib/utils/nutrition";
import type { DailyGoals } from "@/hooks/use-tracker-goals";
import {
  userDailyGoalsFormSchema,
  userDailyGoalsDefaultsFromRow,
  type UserDailyGoalsFormValues,
} from "@/lib/validation/user-goals.schema";
import { RhfNumericStepper } from "@/components/forms/numeric-stepper";
import { cn } from "@/lib/utils";
import { pwaMutateFetch } from "@/lib/offline/pwa-fetch";

type Props = {
  totals: MacroTotals;
  goals: DailyGoals | null;
  goalsLoading: boolean;
  onGoalsSaved: () => Promise<void>;
  selectedDateLabel: string;
};

export function CalorieSummary({
  totals,
  goals,
  goalsLoading,
  onGoalsSaved,
  selectedDateLabel,
}: Props) {
  const calorieGoal = goals?.daily_calorie_goal ?? null;
  const remaining = calorieGoal != null ? Math.max(calorieGoal - totals.calories, 0) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-kg-foreground">Today · {selectedDateLabel}</h2>
          <p className="text-xs leading-relaxed text-kg-subtle">Totals are sums of logged foods for this day.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard title="Calories in" value={totals.calories} unit="kcal" accent="bg-kg-primary/15 text-kg-secondary" />
        <SummaryCard
          title="Calories left"
          value={remaining}
          unit="kcal"
          accent="bg-kg-accent/15 text-kg-foreground"
          emptyHint={calorieGoal == null ? "Set a calorie goal below" : undefined}
        />
        <SummaryCard title="Protein" value={totals.protein} unit="g" accent="bg-kg-secondary/10 text-kg-secondary" />
        <SummaryCard
          title="Carbs"
          value={totals.carbs}
          unit="g"
          accent="bg-black/5 text-kg-foreground dark:bg-white/10"
        />
        <SummaryCard title="Fat" value={totals.fat} unit="g" accent="bg-black/5 text-kg-foreground dark:bg-white/10" />
      </div>

      {goalsLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />
      ) : (
        <GoalsEditor goals={goals} onGoalsSaved={onGoalsSaved} />
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  unit,
  accent,
  emptyHint,
}: {
  title: string;
  value: number | null;
  unit: string;
  accent: string;
  emptyHint?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-black/5 p-4 shadow-sm", accent)}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{title}</p>
      {value == null ? (
        <p className="mt-2 text-sm text-kg-neutral-800/60">{emptyHint ?? "—"}</p>
      ) : (
        <p className="mt-2 text-2xl font-bold tabular-nums">
          {Math.round(value)}
          <span className="ml-1 text-sm font-medium opacity-70">{unit}</span>
        </p>
      )}
    </div>
  );
}

function GoalsEditor({ goals, onGoalsSaved }: { goals: DailyGoals | null; onGoalsSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const hasAllGoals =
    goals?.daily_calorie_goal != null &&
    goals?.daily_protein_goal_g != null &&
    goals?.daily_carbs_goal_g != null &&
    goals?.daily_fat_goal_g != null;

  if (hasAllGoals && !editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 kg-card px-4 py-3">
        <p className="text-sm leading-relaxed text-kg-muted">
          Daily targets: <span className="font-semibold text-kg-secondary">{goals!.daily_calorie_goal} kcal</span>, P{" "}
          {Number(goals!.daily_protein_goal_g)}g · C {Number(goals!.daily_carbs_goal_g)}g · F{" "}
          {Number(goals!.daily_fat_goal_g)}g
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-h-11 min-w-[44px] rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-kg-primary hover:bg-kg-neutral-100"
        >
          Edit targets
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        hasAllGoals
          ? "kg-card p-4 sm:p-5"
          : "rounded-2xl border border-dashed border-kg-primary/50 bg-kg-elevated p-4 text-kg-foreground shadow-sm sm:p-5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-kg-secondary">Daily targets</p>
          <p className="mt-1 text-xs text-kg-neutral-800/60">
            Stored in Supabase. Rings and “calories left” use only these numbers — not AI.
          </p>
        </div>
        {hasAllGoals ? (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="min-h-11 rounded-xl px-3 text-sm font-medium text-kg-muted hover:bg-kg-surface"
          >
            Cancel
          </button>
        ) : null}
      </div>
      <GoalsForm
        key={`${hasAllGoals ? "edit" : "setup"}-${goals?.daily_calorie_goal ?? "x"}-${goals?.daily_protein_goal_g ?? "x"}`}
        initial={goals}
        onSuccess={async () => {
          await onGoalsSaved();
          setEditing(false);
          toast.success("Targets saved");
        }}
      />
    </div>
  );
}

function GoalsForm({
  initial,
  onSuccess,
}: {
  initial: DailyGoals | null;
  onSuccess: () => Promise<void>;
}) {
  const form = useForm<UserDailyGoalsFormValues>({
    resolver: zodResolver(userDailyGoalsFormSchema),
    defaultValues: userDailyGoalsDefaultsFromRow(initial),
  });
  const { control } = form;

  async function onSubmit(data: UserDailyGoalsFormValues) {
    try {
      const res = await pwaMutateFetch("/api/user/goals", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 202) {
        toast.success("Targets queued — will sync online");
        await onSuccess();
        return;
      }
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      await onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save targets");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 grid gap-3 sm:grid-cols-2">
      <RhfNumericStepper
        control={control}
        name="daily_calorie_goal"
        label="Calorie goal (kcal)"
        min={500}
        max={20000}
        step={50}
      />
      <RhfNumericStepper
        control={control}
        name="daily_protein_goal_g"
        label="Protein (g)"
        min={1}
        max={1000}
        step={1}
      />
      <RhfNumericStepper
        control={control}
        name="daily_carbs_goal_g"
        label="Carbs (g)"
        min={1}
        max={2000}
        step={1}
      />
      <RhfNumericStepper
        control={control}
        name="daily_fat_goal_g"
        label="Fat (g)"
        min={1}
        max={1000}
        step={1}
      />
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-h-11 w-full rounded-xl bg-kg-primary py-2.5 text-sm font-semibold text-white hover:bg-kg-secondary disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {form.formState.isSubmitting ? "Saving…" : "Save targets"}
        </button>
      </div>
    </form>
  );
}


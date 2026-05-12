"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useHealthSettings } from "@/hooks/use-health-settings";
import { pwaMutateFetch } from "@/lib/offline/pwa-fetch";
import { toast } from "@/lib/toast";
import { waterGoalFormSchema, type WaterGoalFormValues } from "@/lib/validation/water-goal.schema";
import { RhfNumericStepper } from "@/components/forms/numeric-stepper";

const WATER_GOAL_DEFAULT_ML = 2500;

export function WaterGoalSettings() {
  const { user } = useSupabaseAuth();
  const { settings, reload } = useHealthSettings(Boolean(user));

  const form = useForm<WaterGoalFormValues>({
    resolver: zodResolver(waterGoalFormSchema),
    defaultValues: {
      daily_water_goal_ml: settings?.daily_water_goal_ml ?? WATER_GOAL_DEFAULT_ML,
    },
  });

  useEffect(() => {
    form.reset({
      daily_water_goal_ml: settings?.daily_water_goal_ml ?? WATER_GOAL_DEFAULT_ML,
    });
  }, [settings, form]);

  async function onSubmit(data: WaterGoalFormValues) {
    try {
      const res = await pwaMutateFetch("/api/user/health-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_water_goal_ml: data.daily_water_goal_ml }),
      });
      if (res.status === 202) {
        toast.success("Water goal queued — will sync online");
        return;
      }
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      await reload();
      toast.success("Water goal saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  }

  if (!user) return null;

  const current = settings?.daily_water_goal_ml ?? null;

  return (
    <div className="kg-card p-5">
      <h2 className="text-sm font-semibold text-kg-secondary">Water goal</h2>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">
        Daily hydration target (ml). Used on the Water screen.
      </p>
      {current != null ? (
        <p className="mt-2 text-sm text-kg-foreground">
          Current: <span className="font-semibold">{current} ml</span>
        </p>
      ) : null}
      <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={form.handleSubmit(onSubmit)}>
        <RhfNumericStepper
          control={form.control}
          name="daily_water_goal_ml"
          label="Target (ml)"
          min={500}
          max={20000}
          step={50}
          className="min-w-[200px] flex-1"
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-h-11 rounded-xl bg-kg-secondary px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {form.formState.isSubmitting ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import type { FoodDatabaseRow, FoodLog, MealType } from "@/types/database";
import { foodLogFormSchema, type FoodLogFormValues } from "@/lib/validation/food-log.schema";
import { valueAsNumber } from "@/lib/forms/register-numeric";
import { FormField } from "@/components/forms/form-field";
import { RhfNumericStepper } from "@/components/forms/numeric-stepper";
import { FoodSearchCombobox, foodDatabaseLabel } from "@/components/tracker/food-search-combobox";
import { cn } from "@/lib/utils";
import { calculateLogTotalsFromFood, defaultUserAmountForUnit } from "@/lib/nutrition/calculate-macros";
import { nutritionRowForScaling } from "@/lib/nutrition/serving-converter";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultMealType: MealType;
  editLog?: FoodLog | null;
  template?: FoodLog | null;
  onSubmitEntry: (values: FoodLogFormValues, editId?: string) => Promise<void>;
  recentFoodLogs?: FoodLog[];
};

function safeKcal(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n));
}

function safeMacroDisplay(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n * 10) / 10);
}

const MEALS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snacks" },
];

function servingBounds(row: FoodDatabaseRow) {
  const isW = row.reference_unit === "g" || row.reference_unit === "ml";
  return {
    min: isW ? 1 : 0.25,
    max: isW ? 2000 : 50,
    step: isW ? 5 : 0.25,
  };
}

function clampServingAmount(row: FoodDatabaseRow, raw: number) {
  const { min, max } = servingBounds(row);
  if (!Number.isFinite(raw)) return min;
  return Math.min(max, Math.max(min, raw));
}

export function AddFoodModal({
  open,
  onClose,
  defaultMealType,
  editLog,
  template,
  onSubmitEntry,
  recentFoodLogs,
}: Props) {
  const form = useForm<FoodLogFormValues>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues: getFoodFormDefaults(defaultMealType, editLog, template),
  });

  const [selectedRow, setSelectedRow] = useState<FoodDatabaseRow | null>(null);
  /** User amount in the food's `reference_unit` (g/ml count, or piece/serving count). Default 1 — not 100 (100 is only a sensible default for grams). */
  const [servingAmount, setServingAmount] = useState(1);

  useEffect(() => {
    if (!open) return;
    form.reset(getFoodFormDefaults(defaultMealType, editLog, template));
    setSelectedRow(null);
    setServingAmount(1);
  }, [open, defaultMealType, editLog, template, form]);

  const applyDatabaseRow = useCallback(
    (row: FoodDatabaseRow, amount: number) => {
      const t = calculateLogTotalsFromFood(row, amount);
      form.setValue("calories", Math.round(Number(t.calories)) || 0, { shouldValidate: true });
      form.setValue("protein", Number(t.protein) || 0, { shouldValidate: true });
      form.setValue("carbs", Number(t.carbs) || 0, { shouldValidate: true });
      form.setValue("fat", Number(t.fat) || 0, { shouldValidate: true });
      form.setValue("quantity", Number(t.quantity) || 1, { shouldValidate: true });
    },
    [form],
  );

  useEffect(() => {
    if (!selectedRow) return;
    applyDatabaseRow(selectedRow, servingAmount);
  }, [selectedRow, servingAmount, applyDatabaseRow]);

  async function onSubmit(values: FoodLogFormValues) {
    try {
      await onSubmitEntry(values, editLog?.id);
      onClose();
    } catch {
      /* keep modal open; parent shows toast */
    }
  }

  const scaledUnit = selectedRow ? nutritionRowForScaling(selectedRow).reference_unit : null;
  const isWeightVolumeMode = scaledUnit === "g" || scaledUnit === "ml";
  const isMl = scaledUnit === "ml";
  const bounds = selectedRow ? servingBounds(selectedRow) : { min: 1, max: 2000, step: 5 };
  const { min: servingMin, max: servingMax, step: servingStep } = bounds;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px] dark:bg-black/70"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="food-modal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative z-10 max-h-[min(92dvh,720px)] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-kg-border bg-kg-elevated text-kg-foreground shadow-2xl",
              "sm:rounded-3xl",
              "pb-[max(1rem,env(safe-area-inset-bottom))] pt-6",
            )}
          >
            <div className="px-5 sm:px-6">
              <h2 id="food-modal-title" className="text-lg font-bold">
                {editLog ? "Edit food" : "Add food"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-kg-muted">
                Search the nutrition library — calories and macros fill automatically. Adjust amount to scale.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4 px-5 pb-6 sm:px-6">
              <Controller
                name="food_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FoodSearchCombobox
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      if (
                        selectedRow &&
                        v.trim().toLowerCase() !== foodDatabaseLabel(selectedRow).trim().toLowerCase()
                      ) {
                        setSelectedRow(null);
                      }
                    }}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    recentFoodLogs={recentFoodLogs}
                    selectedFoodId={selectedRow?.id ?? null}
                    onSelectDatabaseFood={(row) => {
                      setSelectedRow(row);
                      setServingAmount(defaultUserAmountForUnit(row));
                    }}
                    onSelectRecentFood={(hit) => {
                      setSelectedRow(null);
                      form.setValue("food_name", hit.food_name, { shouldValidate: true });
                      form.setValue("calories", hit.calories, { shouldValidate: true });
                      form.setValue("protein", hit.protein, { shouldValidate: true });
                      form.setValue("carbs", hit.carbs, { shouldValidate: true });
                      form.setValue("fat", hit.fat, { shouldValidate: true });
                      form.setValue("quantity", hit.quantity, { shouldValidate: true });
                    }}
                  />
                )}
              />

              {selectedRow ? (
                <div className="space-y-2 rounded-2xl border border-kg-border bg-kg-surface/80 p-3 dark:bg-black/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-kg-secondary">Serving</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-kg-primary hover:underline"
                      onClick={() => {
                        setSelectedRow(null);
                      }}
                    >
                      Change food
                    </button>
                  </div>
                  <p className="text-[11px] leading-snug text-kg-muted">{selectedRow.serving_size}</p>
                  <label className="block text-xs font-medium text-kg-muted">
                    {isMl ? "Amount (ml)" : isWeightVolumeMode ? "Amount (grams)" : "Amount (count of reference)"}
                    <input
                      type="number"
                      inputMode="decimal"
                      min={servingMin}
                      max={servingMax}
                      step={servingStep}
                      className="mt-1 w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 text-sm text-kg-foreground"
                      value={servingAmount}
                      onChange={(e) => {
                        const n = Number.parseFloat(e.target.value);
                        const next = Number.isFinite(n) ? n : servingMin;
                        setServingAmount(clampServingAmount(selectedRow, next));
                      }}
                      onBlur={() => {
                        setServingAmount(clampServingAmount(selectedRow, servingAmount));
                      }}
                    />
                  </label>
                  {isWeightVolumeMode ? (
                    <input
                      type="range"
                      aria-label={isMl ? "Adjust milliliters" : "Adjust grams"}
                      min={10}
                      max={isMl ? 1000 : 500}
                      step={5}
                      value={Math.min(isMl ? 1000 : 500, Math.max(10, servingAmount))}
                      onChange={(e) => setServingAmount(Number(e.target.value))}
                      className="w-full accent-kg-primary"
                    />
                  ) : null}
                </div>
              ) : (
                <RhfNumericStepper
                  control={form.control}
                  name="quantity"
                  label="Quantity (servings)"
                  min={0.25}
                  max={50}
                  step={0.25}
                />
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Meal" error={form.formState.errors.meal_type?.message}>
                  <select
                    className="w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 py-2 text-sm text-kg-foreground"
                    {...form.register("meal_type")}
                  >
                    {MEALS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <div className="rounded-xl border border-kg-border bg-kg-surface/60 px-3 py-2 dark:bg-black/20">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-kg-subtle">Auto totals</p>
                  <p className="mt-1 text-sm font-semibold text-kg-foreground tabular-nums">
                    {safeKcal(form.watch("calories"))} kcal · P{safeMacroDisplay(form.watch("protein"))} · C
                    {safeMacroDisplay(form.watch("carbs"))} · F{safeMacroDisplay(form.watch("fat"))}
                  </p>
                  <p className="mt-0.5 text-[11px] text-kg-muted">
                    Log multiplier qty: {safeMacroDisplay(form.watch("quantity"))}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Calories (kcal)" error={form.formState.errors.calories?.message}>
                  <input
                    type="number"
                    className="w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 py-2 text-sm text-kg-foreground"
                    {...form.register("calories", valueAsNumber)}
                  />
                </FormField>
                <FormField label="Protein (g)" error={form.formState.errors.protein?.message}>
                  <input
                    type="number"
                    step="any"
                    className="w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 py-2 text-sm text-kg-foreground"
                    {...form.register("protein", valueAsNumber)}
                  />
                </FormField>
                <FormField label="Carbs (g)" error={form.formState.errors.carbs?.message}>
                  <input
                    type="number"
                    step="any"
                    className="w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 py-2 text-sm text-kg-foreground"
                    {...form.register("carbs", valueAsNumber)}
                  />
                </FormField>
                <FormField label="Fat (g)" error={form.formState.errors.fat?.message}>
                  <input
                    type="number"
                    step="any"
                    className="w-full min-h-11 rounded-xl border border-kg-border bg-kg-input px-3 py-2 text-sm text-kg-foreground"
                    {...form.register("fat", valueAsNumber)}
                  />
                </FormField>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 flex-1 rounded-xl border border-kg-border py-2.5 text-sm font-semibold text-kg-foreground hover:bg-kg-surface sm:flex-none sm:px-6"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="min-h-11 flex-1 rounded-xl bg-kg-primary py-2.5 text-sm font-semibold text-white hover:bg-kg-secondary disabled:opacity-50 sm:flex-auto sm:px-8"
                >
                  {form.formState.isSubmitting ? "Saving…" : editLog ? "Save changes" : "Save food"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function getFoodFormDefaults(
  meal: MealType,
  editLog: FoodLog | null | undefined,
  template: FoodLog | null | undefined,
): FoodLogFormValues {
  if (editLog) {
    return {
      food_name: editLog.food_name,
      quantity: Number(editLog.quantity) || 1,
      calories: editLog.calories,
      protein: Number(editLog.protein),
      carbs: Number(editLog.carbs),
      fat: Number(editLog.fat),
      meal_type: editLog.meal_type as MealType,
    };
  }
  if (template) {
    return {
      food_name: template.food_name.trim(),
      quantity: Number(template.quantity) || 1,
      calories: template.calories,
      protein: Number(template.protein),
      carbs: Number(template.carbs),
      fat: Number(template.fat),
      meal_type: meal,
    };
  }
  return {
    food_name: "",
    quantity: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    meal_type: meal,
  };
}

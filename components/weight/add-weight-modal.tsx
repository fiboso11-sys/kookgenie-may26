"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import type { WeightLog } from "@/types/database";
import { weightEntryFormSchema, type WeightEntryFormValues } from "@/lib/validation/weight-entry.schema";
import { RhfNumericStepper } from "@/components/forms/numeric-stepper";
import { cn } from "@/lib/utils";

const DEFAULT_WEIGHT_KG = 75;

type Props = {
  open: boolean;
  onClose: () => void;
  edit?: WeightLog | null;
  onSave: (weightKg: number, id?: string) => Promise<void>;
};

function defaultWeightValues(edit?: WeightLog | null): WeightEntryFormValues {
  if (edit == null) return { weight_kg: DEFAULT_WEIGHT_KG };
  const w = Number(edit.weight);
  return { weight_kg: Number.isFinite(w) && w > 0 ? w : DEFAULT_WEIGHT_KG };
}

export function AddWeightModal({ open, onClose, edit, onSave }: Props) {
  const { reset, handleSubmit, formState, control } = useForm<WeightEntryFormValues>({
    resolver: zodResolver(weightEntryFormSchema),
    defaultValues: defaultWeightValues(edit),
  });

  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      reset(defaultWeightValues(edit));
    }
    prevOpen.current = open;
  }, [open, edit, reset]);

  async function onSubmit(data: WeightEntryFormValues) {
    try {
      await onSave(data.weight_kg, edit?.id);
      onClose();
    } catch {
      /* parent surfaces errors */
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="absolute inset-0 bg-black/50 dark:bg-black/70" aria-label="Close" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className={cn(
              "relative z-10 w-full max-w-md rounded-t-3xl border border-kg-border bg-kg-elevated p-6 text-kg-foreground shadow-2xl sm:rounded-3xl",
              "pb-[max(1rem,env(safe-area-inset-bottom))]",
            )}
          >
            <h2 className="text-lg font-bold">{edit ? "Edit weight" : "Log weight"}</h2>
            <p className="mt-1 text-xs leading-relaxed text-kg-muted">Enter body weight in kilograms (kg).</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <RhfNumericStepper
                control={control}
                name="weight_kg"
                label="Weight (kg)"
                min={0.1}
                max={500}
                step={0.1}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 flex-1 rounded-xl border border-kg-border py-2 text-sm font-semibold text-kg-foreground hover:bg-kg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="min-h-12 flex-1 rounded-xl bg-kg-primary py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {formState.isSubmitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

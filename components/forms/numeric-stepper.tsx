"use client";

import { forwardRef, useId } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

type NumericStepperProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  name?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function decimalPlacesOf(step: number) {
  const s = String(step);
  if (!s.includes(".")) return 0;
  return (s.split(".")[1] ?? "").length;
}

/** Snap to the nearest step from `min` so 0.1-steps stay stable. */
export function snapToStep(raw: number, min: number, max: number, step: number) {
  const c = clamp(raw, min, max);
  if (!(step > 0)) return c;
  const k = Math.round((c - min) / step);
  const snapped = min + k * step;
  const decimals = decimalPlacesOf(step);
  return decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;
}

export const NumericStepper = forwardRef<HTMLInputElement, NumericStepperProps>(
  function NumericStepper(
    {
      id,
      value,
      onChange,
      onBlur,
      min = 0,
      max = 10_000,
      step = 1,
      disabled,
      className,
      inputClassName,
      name,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
    },
    ref,
  ) {
    const base = typeof value === "number" && Number.isFinite(value) ? value : min;
    const safe = snapToStep(base, min, max, step);
    const nextDown = snapToStep(safe - step, min, max, step);
    const nextUp = snapToStep(safe + step, min, max, step);

    const btnClass =
      "flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-kg-border bg-kg-elevated text-lg font-semibold leading-none text-kg-foreground hover:bg-kg-surface disabled:cursor-not-allowed disabled:opacity-40";

    return (
      <div className={cn("flex items-stretch gap-1", className)}>
        <button
          type="button"
          aria-label="Decrease"
          className={btnClass}
          disabled={disabled || nextDown >= safe}
          onClick={() => onChange(nextDown)}
        >
          −
        </button>
        <input
          ref={ref}
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            "min-h-11 flex-1 rounded-xl border border-kg-border bg-kg-input px-2 text-center text-sm tabular-nums text-kg-foreground",
            inputClassName,
          )}
          value={safe}
          onChange={(e) => {
            const rawVal = e.target.value;
            if (rawVal === "") {
              onChange(min);
              return;
            }
            const n = e.target.valueAsNumber;
            if (!Number.isFinite(n)) {
              onChange(min);
              return;
            }
            onChange(snapToStep(n, min, max, step));
          }}
          onBlur={onBlur}
        />
        <button
          type="button"
          aria-label="Increase"
          className={btnClass}
          disabled={disabled || nextUp <= safe}
          onClick={() => onChange(nextUp)}
        >
          +
        </button>
      </div>
    );
  },
);

type RhfNumericStepperProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function RhfNumericStepper<T extends FieldValues>({
  control,
  name,
  label,
  min = 1,
  max = 10_000,
  step = 1,
  className,
}: RhfNumericStepperProps<T>) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const errId = `${baseId}-err`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const v =
          typeof field.value === "number" && Number.isFinite(field.value) ? field.value : min;
        return (
          <div className={cn("space-y-1 text-sm", className)}>
            <label htmlFor={inputId} className="block font-medium text-kg-foreground">
              {label}
            </label>
            <NumericStepper
              ref={field.ref}
              id={inputId}
              name={field.name}
              value={v}
              onChange={field.onChange}
              onBlur={field.onBlur}
              min={min}
              max={max}
              step={step}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error?.message ? errId : undefined}
            />
            {fieldState.error?.message ? (
              <span id={errId} role="alert" className="block text-xs text-red-600">
                {fieldState.error.message}
              </span>
            ) : null}
          </div>
        );
      }}
    />
  );
}

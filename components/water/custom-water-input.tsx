"use client";

import { useState } from "react";
import { waterCustomMlSchema } from "@/lib/validation/water-custom.schema";

type Props = {
  disabled?: boolean;
  onAdd: (ml: number) => void;
};

export function CustomWaterInput({ disabled, onAdd }: Props) {
  const [val, setVal] = useState("");

  function submit() {
    const n = Number.parseInt(val, 10);
    const parsed = waterCustomMlSchema.safeParse(n);
    if (!parsed.success) return;
    onAdd(parsed.data);
    setVal("");
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs font-medium text-kg-muted">
        Custom (ml)
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={5000}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="min-h-12 rounded-xl border border-kg-border bg-kg-input px-3 text-sm text-kg-foreground"
          placeholder="e.g. 330"
        />
      </label>
      <button
        type="button"
        disabled={disabled || !val}
        onClick={submit}
        className="min-h-12 rounded-xl bg-kg-secondary px-4 text-sm font-semibold text-white hover:bg-kg-secondary/90 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}

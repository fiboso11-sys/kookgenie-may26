"use client";

import type { WeightLog } from "@/types/database";

type Props = {
  logs: WeightLog[];
  onEdit: (log: WeightLog) => void;
  onDelete: (id: string) => void;
};

export function WeightHistory({ logs, onEdit, onDelete }: Props) {
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-kg-border bg-kg-elevated p-3 text-kg-foreground shadow-sm">
      {logs.slice(0, 50).map((l) => (
        <li
          key={l.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kg-border px-3 py-2 text-sm"
        >
          <span className="font-semibold">{Number(l.weight)} kg</span>
          <span className="text-xs text-kg-muted">{new Date(l.created_at).toLocaleString()}</span>
          <div className="flex gap-1">
            <button
              type="button"
              className="min-h-9 rounded-lg px-2 text-xs font-semibold text-kg-primary hover:bg-kg-surface"
              onClick={() => onEdit(l)}
            >
              Edit
            </button>
            <button
              type="button"
              className="min-h-9 rounded-lg px-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => onDelete(l.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
      {logs.length === 0 ? (
        <li className="px-3 py-6 text-center text-sm text-kg-muted">No weight entries yet.</li>
      ) : null}
    </ul>
  );
}

"use client";

type Props = {
  /** Each 0–1 component; null means that metric is not configured and is excluded. */
  parts: { label: string; value: number | null }[];
};

/**
 * Simple composite: average of configured goal-completion ratios (capped at 1).
 * Not a medical score — only reflects how close you are to today’s configured targets.
 */
export function HealthScore({ parts }: Props) {
  const usable = parts.filter((p): p is { label: string; value: number } => p.value != null);
  const score =
    usable.length === 0
      ? null
      : Math.round((usable.reduce((s, p) => s + Math.min(1, Math.max(0, p.value)), 0) / usable.length) * 100);

  return (
    <div className="rounded-2xl border border-kg-border bg-gradient-to-br from-kg-primary/15 to-kg-elevated p-5 text-kg-foreground shadow-sm">
      <h2 className="text-sm font-semibold text-kg-secondary">Today’s target balance</h2>
      <p className="mt-1 text-xs leading-relaxed text-kg-muted">Average progress toward goals you set (not medical advice).</p>
      <p className="mt-4 text-5xl font-bold text-kg-secondary">{score != null ? score : "—"}</p>
      <p className="text-sm text-kg-muted">of 100</p>
      <ul className="mt-4 space-y-1 text-xs leading-snug text-kg-muted">
        {parts.map((p) => (
          <li key={p.label}>
            {p.label}: {p.value == null ? "not set" : `${Math.round(Math.min(1, p.value) * 100)}%`}
          </li>
        ))}
      </ul>
    </div>
  );
}

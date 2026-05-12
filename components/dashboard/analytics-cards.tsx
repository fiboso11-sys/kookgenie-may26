"use client";

type Card = { title: string; value: string; hint?: string };

export function AnalyticsCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c) => (
        <div key={c.title} className="kg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-kg-subtle">{c.title}</p>
          <p className="mt-2 text-xl font-bold text-kg-foreground">{c.value}</p>
          {c.hint ? <p className="mt-1 text-xs leading-snug text-kg-muted">{c.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

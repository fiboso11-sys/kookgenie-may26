"use client";

import { useEffect, useMemo, useState } from "react";

type Style = { id: "16:8" | "18:6" | "OMAD"; label: string; fastingHours: number; eatingHours: number };

const styles: Style[] = [
  { id: "16:8", label: "16:8", fastingHours: 16, eatingHours: 8 },
  { id: "18:6", label: "18:6", fastingHours: 18, eatingHours: 6 },
  { id: "OMAD", label: "OMAD (1 meal)", fastingHours: 23, eatingHours: 1 },
];

type Session = { style: Style["id"]; startedAt: number; endedAt?: number };

const HISTORY_KEY = "kookgenie-fasting-history";

export function FastingTracker() {
  const [style, setStyle] = useState<Style>(styles[0]);
  const [active, setActive] = useState<Session | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as Session[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-20)));
  }, [history]);

  const targetMs = style.fastingHours * 3600 * 1000;

  const elapsed = useMemo(() => {
    if (!active) return 0;
    return now - active.startedAt;
  }, [active, now]);

  const remaining = Math.max(0, targetMs - elapsed);
  const pct = active ? Math.min(100, (elapsed / targetMs) * 100) : 0;

  function startFast() {
    setActive({ style: style.id, startedAt: Date.now() });
  }

  function endFast() {
    if (!active) return;
    const ended = { ...active, endedAt: Date.now() };
    setHistory((h) => [...h, ended]);
    setActive(null);
  }

  function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-neutral-800">
            Fasting style
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStyle(s);
                  setActive(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  style.id === s.id ? "bg-kg-primary text-white" : "bg-kg-neutral-100 text-kg-neutral-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-kg-neutral-800/70">
            Fast window: {style.fastingHours}h · Eating window: {style.eatingHours}h
          </p>
        </div>

        <div className="rounded-2xl bg-kg-neutral-100 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-kg-secondary">Fasting timer</p>
          <p className="mt-4 font-mono text-4xl font-bold text-kg-neutral-800">{active ? fmt(elapsed) : "00:00:00"}</p>
          <p className="mt-2 text-sm text-kg-neutral-800/70">
            {active ? `Remaining to goal: ${fmt(remaining)}` : "Press start to track a fast"}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-kg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={startFast}
              disabled={Boolean(active)}
              className="rounded-xl bg-kg-secondary px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Start fast
            </button>
            <button
              type="button"
              onClick={endFast}
              disabled={!active}
              className="rounded-xl border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-kg-neutral-800 disabled:opacity-40"
            >
              End & log
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-neutral-800">
          Fasting history
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {history.length === 0 && <li className="text-kg-neutral-800/60">No sessions yet — complete a fast to see it here.</li>}
          {history
            .slice()
            .reverse()
            .map((h, i) => {
              const dur = (h.endedAt ?? now) - h.startedAt;
              return (
                <li key={i} className="flex items-center justify-between rounded-xl bg-kg-neutral-100 px-3 py-2">
                  <span className="font-medium text-kg-neutral-800">{h.style}</span>
                  <span className="text-kg-neutral-800/70">{fmt(dur)}</span>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

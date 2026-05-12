import Link from "next/link";
import { workouts } from "@/data/workouts";

export default function WorkoutsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">Workouts</h1>
        <p className="mt-2 text-kg-neutral-800/70">Programs by category with sets, reps, and estimated burn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {workouts.map((w) => (
          <Link
            key={w.id}
            href={`/workouts/${w.id}`}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="rounded-full bg-kg-primary/10 px-3 py-1 text-xs font-semibold text-kg-secondary">
              {w.category}
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-semibold text-kg-neutral-800">
              {w.title}
            </h2>
            <p className="mt-2 text-sm text-kg-neutral-800/70">{w.description}</p>
            <p className="mt-3 text-sm font-medium text-kg-primary">~{w.durationMin} min · View exercises →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

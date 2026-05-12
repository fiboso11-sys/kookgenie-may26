import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { getWorkoutById } from "@/data/workouts";

type Props = { params: Promise<{ id: string }> };

export default async function WorkoutDetailPage({ params }: Props) {
  const { id } = await params;
  const w = getWorkoutById(id);
  if (!w) notFound();

  const totalCal = w.exercises.reduce((acc, e) => acc + e.caloriesEst, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/workouts" className="text-sm font-medium text-kg-primary hover:underline">
        ← All workouts
      </Link>
      <div>
        <span className="rounded-full bg-kg-primary/10 px-3 py-1 text-xs font-semibold text-kg-secondary">
          {w.category}
        </span>
        <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          {w.title}
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">{w.description}</p>
        <p className="mt-2 text-sm font-medium text-kg-neutral-800">
          Session ~{w.durationMin} min · Est. {totalCal} kcal burned (illustrative)
        </p>
      </div>
      <VideoPlaceholder title={`${w.title} — follow-along`} />
      <section className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-kg-neutral-100 text-xs uppercase tracking-wide text-kg-neutral-800/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Exercise</th>
              <th className="px-4 py-3 font-semibold">Sets</th>
              <th className="px-4 py-3 font-semibold">Reps</th>
              <th className="px-4 py-3 font-semibold">kcal (est.)</th>
            </tr>
          </thead>
          <tbody>
            {w.exercises.map((e) => (
              <tr key={e.name} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3 font-medium text-kg-neutral-800">{e.name}</td>
                <td className="px-4 py-3 text-kg-neutral-800/80">{e.sets}</td>
                <td className="px-4 py-3 text-kg-neutral-800/80">{e.reps}</td>
                <td className="px-4 py-3 text-kg-neutral-800/80">{e.caloriesEst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

import Link from "next/link";
import { lessons } from "@/data/lessons";

export default function AcademyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          Cooking Academy
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Beginner tracks with video placeholders, steps, and pro tips.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l) => (
          <Link
            key={l.slug}
            href={`/academy/${l.slug}`}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-kg-neutral-800">
              {l.title}
            </h2>
            <p className="mt-2 text-sm text-kg-neutral-800/70">{l.summary}</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-kg-primary">View lesson →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

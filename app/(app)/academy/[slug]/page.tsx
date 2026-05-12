import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { getLessonBySlug } from "@/data/lessons";

type Props = { params: Promise<{ slug: string }> };

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/academy" className="text-sm font-medium text-kg-primary hover:underline">
        ← All lessons
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          {lesson.title}
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">{lesson.summary}</p>
      </div>
      <VideoPlaceholder title={`${lesson.title} — video`} />
      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-neutral-800">
          Step-by-step
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-kg-neutral-800/85">
          {lesson.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>
      <section className="rounded-2xl border border-kg-primary/20 bg-kg-primary/5 p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-secondary">Tips</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-kg-neutral-800/85">
          {lesson.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

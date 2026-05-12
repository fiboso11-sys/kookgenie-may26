import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const features = [
  {
    title: "Cooking Academy",
    desc: "Step-by-step lessons from kitchen setup to meal prep—built for beginners.",
    icon: "📚",
  },
  {
    title: "AI Cooking Tools",
    desc: "Chat with KookGenie for techniques, healthy swaps, and smart cooking help.",
    icon: "✨",
  },
  {
    title: "Meal Planning",
    desc: "AI meal plans aligned to your diet, calories, and fitness goals.",
    icon: "🗓️",
  },
  {
    title: "Fitness Tracking",
    desc: "Structured programs for fat loss, muscle gain, yoga, and beginners.",
    icon: "💪",
  },
  {
    title: "Health Monitoring",
    desc: "Log weight, steps, calories, and see progress charts at a glance.",
    icon: "📈",
  },
  {
    title: "Grocery Assistant",
    desc: "Send recipe ingredients to your list with one tap—shop with confidence.",
    icon: "🛒",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-kg-neutral-800">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo href="/" size="md" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-kg-neutral-800/80 md:flex">
            <a href="#features" className="hover:text-kg-primary">
              Features
            </a>
            <a href="#preview" className="hover:text-kg-primary">
              Preview
            </a>
            <a href="#cta" className="hover:text-kg-primary">
              Get started
            </a>
          </nav>
          <Link
            href="/home"
            className="rounded-xl bg-kg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Open app
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-kg-neutral-100 to-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(22,163,74,0.15),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.12),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-kg-secondary">
              Cook Smart. Live Healthy.
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-kg-neutral-800 sm:text-5xl">
              KookGenie – Your AI Cooking, Health &amp; Fitness Companion
            </h1>
            <p className="max-w-xl text-lg text-kg-neutral-800/80">
              Learn cooking from scratch, generate healthy recipes with AI, plan meals, track workouts, and monitor
              your health.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center rounded-xl bg-kg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
              >
                Try AI Assistant
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-kg-neutral-800 shadow-sm transition hover:border-kg-primary/40"
              >
                Explore Recipes
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-kg-neutral-800/65">
              <span>✓ Demo-ready mock data</span>
              <span>✓ Mobile responsive</span>
              <span>✓ OpenAI when configured</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=80"
                alt="Fresh ingredients and healthy cooking"
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                <p className="text-sm font-semibold text-kg-secondary">Friendly AI chef genie</p>
                <p className="text-xs text-kg-neutral-800/70">
                  Your mascot: chef hat, spoon in hand, guiding every meal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
            Everything you need to cook better &amp; live healthier
          </h2>
          <p className="mt-3 text-kg-neutral-800/70">
            Card-based modules mirror the full app—explore each pillar of the KookGenie experience.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-kg-neutral-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden>
                {f.icon}
              </span>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-kg-neutral-800">
                {f.title}
              </h3>
              <p className="text-sm text-kg-neutral-800/75">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="preview" className="bg-kg-neutral-100 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
              App screens preview
            </h2>
            <p className="mt-3 text-kg-neutral-800/70">
              A clean, minimalist interface that scales beautifully from phone to desktop.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "AI Assistant", href: "/assistant", img: "photo-1547592180-85f173990554" },
              { title: "Recipes", href: "/recipes", img: "photo-1504674900247-0877df9cc836" },
              { title: "Workouts", href: "/workouts", img: "photo-1517836357463-d25dfeac3438" },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={`https://images.unsplash.com/${s.img}?w=600&q=80`}
                    alt={s.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                    {s.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-kg-secondary to-kg-primary px-8 py-14 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_45%)]" />
          <div className="relative mx-auto max-w-2xl space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
              Ready to cook smarter?
            </h2>
            <p className="text-white/90">
              Jump into the demo app—mock data keeps every flow interactive while you wire up Supabase and OpenAI.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/home"
                className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-kg-secondary shadow-md transition hover:bg-kg-neutral-100"
              >
                Launch KookGenie
              </Link>
              <Link
                href="/meal-planner"
                className="inline-flex rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Try meal planner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo href="/" size="sm" />
          <p className="text-sm text-kg-neutral-800/60">© {new Date().getFullYear()} KookGenie · Demo product</p>
        </div>
      </footer>
    </div>
  );
}

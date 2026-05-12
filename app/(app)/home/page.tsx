import Link from "next/link";

const tiles = [
  { href: "/assistant", title: "AI Assistant", desc: "Ask cooking & fitness questions", color: "from-kg-primary to-emerald-600" },
  { href: "/academy", title: "Cooking Academy", desc: "Beginner lessons with video placeholders", color: "from-kg-secondary to-teal-700" },
  { href: "/recipes", title: "Recipes", desc: "Browse the demo recipe library", color: "from-kg-accent to-orange-600" },
  { href: "/generator", title: "AI Recipe Generator", desc: "Ingredients in → full recipe out", color: "from-emerald-500 to-kg-primary" },
  { href: "/meal-planner", title: "Meal Planner", desc: "Diet, calories, goals → daily plan", color: "from-teal-600 to-kg-secondary" },
  { href: "/workouts", title: "Workouts", desc: "Programs by goal and level", color: "from-orange-500 to-kg-accent" },
  { href: "/health", title: "Health Tracker", desc: "Log metrics & view charts", color: "from-sky-500 to-blue-700" },
  { href: "/fasting", title: "Fasting Tracker", desc: "16:8, 18:6, OMAD timers", color: "from-violet-500 to-purple-700" },
  { href: "/grocery", title: "Grocery List", desc: "Built from recipes & meal plans", color: "from-lime-500 to-kg-primary" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-kg-secondary">Welcome back</p>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          Your KookGenie hub
        </h1>
        <p className="mt-2 max-w-2xl text-kg-neutral-800/70">
          Demo mode uses mock data everywhere. Add <code className="rounded bg-black/5 px-1">OPENAI_API_KEY</code> for
          live AI responses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 ${t.color}`}
            />
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-neutral-800 group-hover:text-kg-primary">
              {t.title}
            </h2>
            <p className="mt-2 text-sm text-kg-neutral-800/70">{t.desc}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-kg-secondary">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

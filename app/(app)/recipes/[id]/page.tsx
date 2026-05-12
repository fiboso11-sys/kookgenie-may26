import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyIngredientsButton } from "@/components/BuyIngredientsButton";
import { getRecipeById } from "@/data/recipes";

type Props = { params: Promise<{ id: string }> };

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/recipes" className="text-sm font-medium text-kg-primary hover:underline">
        ← All recipes
      </Link>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="relative aspect-video w-full">
          <Image src={recipe.image} alt={recipe.title} fill className="object-cover" sizes="100vw" priority />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((t) => (
              <span key={t} className="rounded-full bg-kg-neutral-100 px-3 py-1 text-xs font-medium text-kg-secondary">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
            {recipe.title}
          </h1>
          <p className="text-sm text-kg-neutral-800/70">
            {recipe.calories} kcal · {recipe.cookTimeMin} min cook time
          </p>
          <BuyIngredientsButton ingredients={recipe.ingredients} />
        </div>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Ingredients</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-kg-neutral-800/85">
          {recipe.ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Instructions</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-kg-neutral-800/85">
          {recipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">Nutrition</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recipe.nutrition.map((n) => (
            <div key={n.label} className="rounded-xl bg-kg-neutral-100 px-3 py-3 text-center">
              <p className="text-xs text-kg-neutral-800/60">{n.label}</p>
              <p className="text-lg font-semibold text-kg-neutral-800">{n.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

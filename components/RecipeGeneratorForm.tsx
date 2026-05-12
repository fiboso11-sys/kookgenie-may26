"use client";

import { FormEvent, useState } from "react";
import { BuyIngredientsButton } from "@/components/BuyIngredientsButton";

type RecipeResult = {
  name: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  cookTimeMin: number;
};

export function RecipeGeneratorForm() {
  const [lines, setLines] = useState("Chicken\nGarlic\nTomato");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [demo, setDemo] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ingredients = lines
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!ingredients.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (data.recipe) {
        setRecipe(data.recipe as RecipeResult);
        setDemo(Boolean(data.demo));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-kg-neutral-800">Ingredients (one per line)</label>
        <textarea
          className="min-h-40 w-full rounded-xl border border-black/10 bg-kg-neutral-100 p-3 text-sm outline-none focus:border-kg-primary"
          value={lines}
          onChange={(e) => setLines(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-kg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate recipe"}
        </button>
        {demo && recipe && (
          <p className="text-xs text-kg-neutral-800/60">Demo recipe — configure OpenAI for unique generations.</p>
        )}
      </form>

      {recipe && (
        <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-kg-neutral-800">
                {recipe.name}
              </h2>
              <p className="mt-1 text-sm text-kg-neutral-800/70">
                ~{recipe.calories} kcal · {recipe.cookTimeMin} min
              </p>
            </div>
            <BuyIngredientsButton ingredients={recipe.ingredients} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-kg-secondary">Ingredients</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-kg-neutral-800/85">
              {recipe.ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-kg-secondary">Steps</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-kg-neutral-800/85">
              {recipe.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";

export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">Recipes</h1>
        <p className="mt-2 text-kg-neutral-800/70">Mock library with calories, time, and full nutrition panels.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  );
}

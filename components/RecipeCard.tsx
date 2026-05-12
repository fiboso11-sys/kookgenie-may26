import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/data/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-kg-neutral-100">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-kg-neutral-800 group-hover:text-kg-primary">
          {recipe.title}
        </h3>
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-kg-neutral-800/70">
          <span className="rounded-full bg-kg-neutral-100 px-2.5 py-1">{recipe.calories} kcal</span>
          <span className="rounded-full bg-kg-neutral-100 px-2.5 py-1">{recipe.cookTimeMin} min</span>
        </div>
      </div>
    </Link>
  );
}

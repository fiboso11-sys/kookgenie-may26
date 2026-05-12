import { RecipeGeneratorForm } from "@/components/RecipeGeneratorForm";

export default function GeneratorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          AI Recipe Generator
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Enter what you have on hand; get a name, ingredients, steps, calories, and time.
        </p>
      </div>
      <RecipeGeneratorForm />
    </div>
  );
}

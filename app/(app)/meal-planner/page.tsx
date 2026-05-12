import { MealPlannerForm } from "@/components/MealPlannerForm";

export default function MealPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-kg-neutral-800">
          AI Meal Planner
        </h1>
        <p className="mt-2 text-kg-neutral-800/70">
          Diet type, calorie target, and fitness goal shape breakfast, lunch, dinner, and snacks.
        </p>
      </div>
      <MealPlannerForm />
    </div>
  );
}

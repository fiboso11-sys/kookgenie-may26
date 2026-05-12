"use client";

import { useGrocery } from "@/components/GroceryContext";
import { cn } from "@/lib/utils";

type Props = {
  ingredients: string[];
  className?: string;
  label?: string;
};

export function BuyIngredientsButton({
  ingredients,
  className,
  label = "Buy ingredients",
}: Props) {
  const { addItems } = useGrocery();

  return (
    <button
      type="button"
      onClick={() => addItems(ingredients)}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-kg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99]",
        className,
      )}
    >
      {label}
    </button>
  );
}

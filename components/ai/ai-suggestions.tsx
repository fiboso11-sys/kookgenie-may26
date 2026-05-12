"use client";

const CHIPS = [
  "What is a macro in simple terms?",
  "High-protein vegetarian snacks under 200 kcal",
  "How to read a nutrition label quickly?",
  "Balanced plate for lunch — rough portions",
  "Ideas when I'm over my carb goal",
];

type Props = {
  onPick: (text: string) => void;
  disabled?: boolean;
};

export function AiSuggestions({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c) => (
        <button
          key={c}
          type="button"
          disabled={disabled}
          onClick={() => onPick(c)}
          className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-left text-xs font-medium text-kg-neutral-800 shadow-sm hover:border-kg-primary/40 hover:bg-kg-primary/5 disabled:opacity-50"
        >
          {c}
        </button>
      ))}
    </div>
  );
}

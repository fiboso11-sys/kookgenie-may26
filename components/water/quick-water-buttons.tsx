"use client";

const PRESETS = [250, 500, 750, 1000] as const;

type Props = {
  disabled?: boolean;
  onAdd: (ml: number) => void;
};

export function QuickWaterButtons({ disabled, onAdd }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((ml) => (
        <button
          key={ml}
          type="button"
          disabled={disabled}
          onClick={() => onAdd(ml)}
          className="min-h-12 min-w-[72px] rounded-2xl bg-sky-500 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50 active:scale-[0.98]"
        >
          +{ml >= 1000 ? "1L" : `${ml}ml`}
        </button>
      ))}
    </div>
  );
}

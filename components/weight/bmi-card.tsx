"use client";

type Props = {
  bmi: number | null;
  heightCm: number | null;
  weightKg: number | null;
};

export function BmiCard({ bmi, heightCm, weightKg }: Props) {
  return (
    <div className="kg-card p-5">
      <h3 className="text-sm font-semibold text-kg-secondary">BMI</h3>
      <p className="mt-2 text-4xl font-bold text-kg-foreground">{bmi != null ? bmi : "—"}</p>
      <p className="mt-2 text-xs leading-relaxed text-kg-muted">
        From latest logged weight and profile height ({heightCm != null ? `${heightCm} cm` : "set height in health settings"}).
        {weightKg != null ? ` Latest: ${weightKg} kg.` : ""}
      </p>
    </div>
  );
}

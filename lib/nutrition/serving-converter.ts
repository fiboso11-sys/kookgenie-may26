/** Reference units stored on `food_database.reference_unit`. */
export type ReferenceUnit = "g" | "serving" | "piece" | "cup" | "ml";

/** Map DB / import variants to canonical units used by the tracker UI + scaling. */
export function normalizeReferenceUnit(unit: string | null | undefined): ReferenceUnit {
  const s = String(unit ?? "g")
    .trim()
    .toLowerCase();
  if (s === "gram" || s === "grams") return "g";
  if (s === "milliliter" || s === "milliliters" || s === "millilitre" || s === "millilitres") return "ml";
  if (s === "g" || s === "ml" || s === "piece" || s === "serving" || s === "cup") return s;
  return "g";
}

/**
 * Some imports store “per 100 g” macros but leave `reference_unit` as `piece` and `reference_amount` as 100.
 * If `serving_size` clearly references grams — or the food name suggests rice with `100`+`piece` — treat as **per 100 g**.
 */
export function nutritionRowForScaling(row: {
  reference_unit: string;
  reference_amount: number;
  serving_size: string;
  name?: string | null;
  food_name?: string | null;
  calories?: number;
}): { reference_unit: ReferenceUnit; reference_amount: number } {
  const unit = normalizeReferenceUnit(row.reference_unit);
  const ref = Number(row.reference_amount);
  const kcal = Number(row.calories);
  const serving = String(row.serving_size ?? "").toLowerCase();
  const nm = `${String(row.name ?? "")} ${String(row.food_name ?? "")}`.toLowerCase();
  const mentionsGrams = /\b\d+\s*g\b/.test(serving) || /\b100\s*g\b/.test(serving) || serving.includes("gram");
  const riceLikelyPer100g = /\brice\b/i.test(nm) && ref === 100;
  const mislabeledHundredGramPiece =
    (unit === "piece" || unit === "serving") &&
    Number.isFinite(ref) &&
    ref === 100 &&
    (mentionsGrams || riceLikelyPer100g);

  if (mislabeledHundredGramPiece) {
    return { reference_unit: "g", reference_amount: 100 };
  }

  /** Plain rice often stored as 1 “piece” with kcal in the 100–200 / 100 g band. */
  const riceAsOnePieceLikelyPer100g =
    /\brice\b/i.test(nm) &&
    (unit === "piece" || unit === "serving") &&
    ref === 1 &&
    Number.isFinite(kcal) &&
    kcal >= 95 &&
    kcal <= 220;

  if (riceAsOnePieceLikelyPer100g) {
    return { reference_unit: "g", reference_amount: 100 };
  }

  return {
    reference_unit: unit,
    reference_amount: Number.isFinite(ref) && ref > 0 ? ref : 1,
  };
}

/** US legal cup (nutrition labels) ≈ 236.588 ml */
export const ML_PER_US_CUP = 236.588;

export function mlToCup(ml: number): number {
  if (!Number.isFinite(ml) || ml <= 0) return 0;
  return ml / ML_PER_US_CUP;
}

export function cupToMl(cups: number): number {
  if (!Number.isFinite(cups) || cups <= 0) return 0;
  return cups * ML_PER_US_CUP;
}

/**
 * Scale factor from user-entered amount to DB reference row.
 * `userAmount` is always expressed in the food's `reference_unit`
 * (grams for `g`, count for `piece`/`serving`/`cup`, ml for `ml`).
 */
export function servingScaleFactor(referenceAmount: number, referenceUnit: string, userAmount: number): number {
  const ref = Number(referenceAmount);
  if (!Number.isFinite(userAmount) || userAmount <= 0 || !Number.isFinite(ref) || ref <= 0) return 0;
  void referenceUnit;
  return userAmount / ref;
}

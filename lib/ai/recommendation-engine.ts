import { generateGeminiJson } from "@/lib/ai/gemini-client";
import { MEAL_RECOMMEND_SYSTEM, buildRecommendUserPrompt } from "@/lib/ai/ai-prompts";
import { mealRecommendResponseSchema, type MealRecommendResponse } from "@/lib/ai/schemas";

export type RecommendationInput = {
  scenario: string;
  goal: string;
  dietary: string;
  caloriesRemaining: number | null;
  proteinRemaining: number | null;
  carbsRemaining: number | null;
  fatRemaining: number | null;
};

export async function generateMealRecommendations(input: RecommendationInput): Promise<MealRecommendResponse> {
  const userText = buildRecommendUserPrompt({
    goal: input.goal,
    dietary: input.dietary,
    caloriesRemaining: input.caloriesRemaining,
    proteinRemaining: input.proteinRemaining,
    carbsRemaining: input.carbsRemaining,
    fatRemaining: input.fatRemaining,
    scenario: input.scenario,
  });

  const raw = await generateGeminiJson({
    systemInstruction: MEAL_RECOMMEND_SYSTEM,
    userText,
    temperature: 0.35,
    maxOutputTokens: 1800,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model returned non-JSON");
  }
  const out = mealRecommendResponseSchema.safeParse(parsed);
  if (!out.success) {
    throw new Error("Recommendation JSON failed validation");
  }
  return out.data;
}

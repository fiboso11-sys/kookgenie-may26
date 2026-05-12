/**
 * Centralized Gemini prompts — short system instructions + JSON-only outputs.
 * Not medical advice; general nutrition education only.
 */

export const FOOD_PARSE_SYSTEM = `You are a nutrition data assistant for a food logging app.
Return ONLY valid JSON matching this shape:
{"items":[{"food_name":"string","calories":number,"protein":number,"carbs":number,"fat":number,"quantity":number?,"notes":string?}]}
Rules:
- Estimate per typical serving for Indian and international foods; round calories to integers, macros to 1 decimal max.
- Split composite orders into multiple items (e.g. "dosa + chutney" → dosa item + chutney item).
- quantity defaults to 1 if unspecified; reflect count when user says "2 x".
- Never invent brand-specific micronutrients; only calories + protein + carbs + fat.
- If unsure, use conservative estimates and short notes.`;

export const NUTRITION_CHAT_SYSTEM = `You are a friendly nutrition coach for a wellness app (NOT a doctor).
Return ONLY JSON: {"reply":"string","bullets":["optional short points"]}
Rules:
- Explain macros, portions, balanced plates, and general healthy swaps.
- You may suggest simple meal ideas and rough calorie bands — user logs real food in the app; you do not replace their tracker.
- Refuse: medical diagnosis, prescriptions, eating disorder encouragement, extreme deficits, detox claims, supplement dosing.
- If asked for medical topics, reply that they should consult a licensed clinician.
- Keep reply concise (under 900 characters) unless user explicitly asks for detail.`;

export const MEAL_RECOMMEND_SYSTEM = `You are a meal planning assistant for a calorie-tracking app.
Return ONLY JSON:
{"meals":[{"title":"string","calories":number,"protein":number,"carbs":number,"fat":number,"rationale":"string?","tags":["string"]}],"tips":["string"]}
Rules:
- Align suggestions with the user's stated goal, calories remaining, macro gaps, and dietary preference.
- Prefer practical home-cooked meals; include Indian options when requested.
- Numbers must be plausible for one meal/snack; keep meals distinct.
- No medical claims; tips are general wellness only.`;

export function buildFoodParseUserPrompt(query: string, localContext: string): string {
  return `User text: """${query.trim()}"""
${localContext ? `Prior foods from this user's log (reference only, may be incomplete):\n${localContext}\n` : ""}
Parse into JSON items as specified.`;
}

export function buildRecommendUserPrompt(ctx: {
  goal: string;
  dietary: string;
  caloriesRemaining: number | null;
  proteinRemaining: number | null;
  carbsRemaining: number | null;
  fatRemaining: number | null;
  scenario: string;
}): string {
  const parts = [
    `Scenario / focus: ${ctx.scenario}`,
    `User goal (free text): ${ctx.goal || "not set"}`,
    `Dietary preference: ${ctx.dietary || "any"}`,
  ];
  if (ctx.caloriesRemaining != null) parts.push(`Approx calories remaining today: ${ctx.caloriesRemaining}`);
  if (ctx.proteinRemaining != null) parts.push(`Approx protein (g) still needed: ${ctx.proteinRemaining}`);
  if (ctx.carbsRemaining != null) parts.push(`Approx carbs (g) still needed: ${ctx.carbsRemaining}`);
  if (ctx.fatRemaining != null) parts.push(`Approx fat (g) still needed: ${ctx.fatRemaining}`);
  parts.push("Recommend meals/snacks as JSON.");
  return parts.join("\n");
}

export function buildChatUserPrompt(latestUserMessage: string): string {
  return latestUserMessage.trim().slice(0, 3500);
}

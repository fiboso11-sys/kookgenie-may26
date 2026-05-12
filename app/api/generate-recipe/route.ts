import { NextResponse } from "next/server";
import { getOpenAI } from "@/services/openai-server";

type RecipePayload = {
  name: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  cookTimeMin: number;
};

export async function POST(req: Request) {
  let ingredients: string[] = [];
  try {
    const body = (await req.json()) as { ingredients?: string[] };
    ingredients = body.ingredients ?? [];
    if (!ingredients?.length) {
      return NextResponse.json({ error: "ingredients required" }, { status: 400 });
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json({ recipe: mockRecipe(ingredients), demo: true });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a recipe generator. Return JSON only with keys: name (string), ingredients (string[]), steps (string[]), calories (number estimate per serving), cookTimeMin (number).`,
        },
        {
          role: "user",
          content: `Create one cohesive recipe using these ingredients (you may add pantry staples like oil, salt, pepper): ${ingredients.join(", ")}`,
        },
      ],
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("empty");
    const recipe = JSON.parse(raw) as RecipePayload;
    return NextResponse.json({ recipe, demo: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      recipe: mockRecipe(ingredients.length ? ingredients : ["chicken", "garlic", "tomato"]),
      demo: true,
      error: "Used demo recipe",
    });
  }
}

function mockRecipe(ingredients: string[]): RecipePayload {
  const title =
    ingredients.length >= 2
      ? `${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} & ${ingredients[1]} Skillet`
      : "Demo Comfort Bowl";

  const base = ingredients.map((i) => `${i.trim()} — prepped as needed`);
  const pantry = ["Olive oil", "Salt and pepper", "Fresh herbs (optional)"];

  return {
    name: title,
    ingredients: [...base, ...pantry],
    steps: [
      "Prep and chop all ingredients to similar sizes for even cooking.",
      "Heat oil in a skillet; sear proteins or hearty vegetables first.",
      "Add aromatics and remaining ingredients; season gradually.",
      "Simmer or finish in the oven until cooked through and flavors meld.",
      "Rest 2–3 minutes, taste, adjust seasoning, and serve warm.",
    ],
    calories: 420,
    cookTimeMin: 35,
  };
}

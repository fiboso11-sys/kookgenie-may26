import { NextResponse } from "next/server";
import type { MealPlanDay } from "@/lib/meal-plan-types";
import { getOpenAI } from "@/services/openai-server";

export type { MealPlanDay };

export async function POST(req: Request) {
  let diet = "balanced";
  let calories = 2000;
  let goal = "general health";

  try {
    const body = (await req.json()) as {
      dietType?: string;
      calorieTarget?: number;
      fitnessGoal?: string;
    };
    diet = body.dietType?.trim() || diet;
    calories = body.calorieTarget ?? calories;
    goal = body.fitnessGoal?.trim() || goal;

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json({ plan: mockPlan(diet, calories, goal), demo: true });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return JSON only: { breakfast, lunch, dinner, snacks } — each a short string describing one day template aligned to diet, calories, and fitness goal.",
        },
        {
          role: "user",
          content: `Diet: ${diet}. Daily calorie target: ~${calories}. Fitness goal: ${goal}.`,
        },
      ],
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("empty");
    const plan = JSON.parse(raw) as MealPlanDay;
    return NextResponse.json({ plan, demo: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      plan: mockPlan(diet, calories, goal),
      demo: true,
      error: "Used demo meal plan",
    });
  }
}

function mockPlan(diet: string, calories: number, goal: string): MealPlanDay {
  return {
    breakfast: `Oatmeal with berries and Greek yogurt (${diet}, ~${Math.round(calories * 0.25)} kcal) — supports ${goal}.`,
    lunch: `Grilled protein bowl: quinoa, mixed greens, chickpeas, lemon-tahini dressing.`,
    dinner: `Sheet-pan salmon or tofu with roasted vegetables and herb potatoes.`,
    snacks: `Apple + nut butter, veggie sticks + hummus, or a protein smoothie.`,
  };
}

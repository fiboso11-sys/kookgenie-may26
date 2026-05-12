import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { createFoodLog, isValidMealType, listFoodLogs } from "@/services/food-logs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const limitRaw = searchParams.get("limit");
    const limitParsed = limitRaw ? Number.parseInt(limitRaw, 10) : NaN;
    const limit =
      limitRaw && Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : undefined;

    const logs = await listFoodLogs(supabase, user.id, { from, to, limit });
    return jsonOk({ data: logs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const body = (await request.json()) as Record<string, unknown>;

    const food_name = typeof body.food_name === "string" ? body.food_name.trim() : "";
    if (!food_name) return jsonError("food_name is required", 400);

    const calories = Number(body.calories);
    if (!Number.isFinite(calories) || calories < 0 || !Number.isInteger(calories)) {
      return jsonError("calories must be a non-negative integer", 400);
    }

    const protein = Number(body.protein ?? 0);
    const carbs = Number(body.carbs ?? 0);
    const fat = Number(body.fat ?? 0);
    if (![protein, carbs, fat].every((n) => Number.isFinite(n) && n >= 0)) {
      return jsonError("protein, carbs, and fat must be non-negative numbers", 400);
    }

    const quantity = Number(body.quantity ?? 1);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return jsonError("quantity must be a positive number", 400);
    }

    const meal_type = typeof body.meal_type === "string" ? body.meal_type.trim().toLowerCase() : "";
    if (!isValidMealType(meal_type)) {
      return jsonError("meal_type must be breakfast, lunch, dinner, or snack", 400);
    }

    const row = await createFoodLog(supabase, user.id, {
      food_name,
      calories,
      protein,
      carbs,
      fat,
      quantity,
      meal_type,
    });

    return jsonOk({ data: row }, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

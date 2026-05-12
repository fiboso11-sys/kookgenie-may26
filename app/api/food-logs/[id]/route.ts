import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { deleteFoodLog, isValidMealType, updateFoodLog } from "@/services/food-logs";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) return jsonError("Missing id", 400);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const patch: Parameters<typeof updateFoodLog>[3] = {};

    if ("food_name" in body) {
      if (typeof body.food_name !== "string" || !body.food_name.trim()) {
        return jsonError("food_name must be a non-empty string", 400);
      }
      patch.food_name = body.food_name.trim();
    }
    if ("calories" in body) {
      const v = Number(body.calories);
      if (!Number.isFinite(v) || v < 0 || !Number.isInteger(v)) {
        return jsonError("calories must be a non-negative integer", 400);
      }
      patch.calories = v;
    }
    if ("protein" in body) {
      const v = Number(body.protein);
      if (!Number.isFinite(v) || v < 0) return jsonError("protein must be a non-negative number", 400);
      patch.protein = v;
    }
    if ("carbs" in body) {
      const v = Number(body.carbs);
      if (!Number.isFinite(v) || v < 0) return jsonError("carbs must be a non-negative number", 400);
      patch.carbs = v;
    }
    if ("fat" in body) {
      const v = Number(body.fat);
      if (!Number.isFinite(v) || v < 0) return jsonError("fat must be a non-negative number", 400);
      patch.fat = v;
    }
    if ("quantity" in body) {
      const v = Number(body.quantity);
      if (!Number.isFinite(v) || v <= 0) return jsonError("quantity must be a positive number", 400);
      patch.quantity = v;
    }
    if ("meal_type" in body) {
      const m = typeof body.meal_type === "string" ? body.meal_type.trim().toLowerCase() : "";
      if (!isValidMealType(m)) {
        return jsonError("meal_type must be breakfast, lunch, dinner, or snack", 400);
      }
      patch.meal_type = m;
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const row = await updateFoodLog(supabase, user.id, id, patch);
    return jsonOk({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    if (message.includes("0 rows") || message.includes("JSON object")) {
      return jsonError("Not found", 404);
    }
    return jsonError(message, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) return jsonError("Missing id", 400);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    await deleteFoodLog(supabase, user.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { toggleFoodFavorite } from "@/services/food-database";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return jsonError("Unauthorized", 401);

    const body = (await request.json()) as { food_id?: string };
    const foodId = typeof body.food_id === "string" ? body.food_id.trim() : "";
    if (!foodId || foodId.length < 10) return jsonError("food_id required", 400);

    const action = await toggleFoodFavorite(supabase, user.id, foodId);
    return jsonOk({ data: { action } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

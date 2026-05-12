import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import type { DailyGoalsUsersUpdate } from "@/lib/types/users-update";
import { userDailyGoalsSchema, type UserDailyGoalsFormValues } from "@/lib/validation/user-goals.schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const { data, error } = await supabase
      .from("users")
      .select("daily_calorie_goal, daily_protein_goal_g, daily_carbs_goal_g, daily_fat_goal_g")
      .eq("id", user.id)
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return jsonOk({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError("Unauthorized", 401);
    }

    const body: unknown = await request.json();
    const parsed = userDailyGoalsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(" ") || "Invalid body", 400);
    }

    const goals: UserDailyGoalsFormValues = parsed.data;

    const updateData: DailyGoalsUsersUpdate = {
      daily_calorie_goal: goals.daily_calorie_goal,
      daily_protein_goal_g: goals.daily_protein_goal_g,
      daily_carbs_goal_g: goals.daily_carbs_goal_g,
      daily_fat_goal_g: goals.daily_fat_goal_g,
    };

    const { error } = await supabase.from("users").update(updateData).eq("id", user.id);

    if (error) {
      return jsonError(error.message, 500);
    }

    return jsonOk({ data: goals });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonError(message, 500);
  }
}

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import type { HealthSettingsUsersUpdate } from "@/lib/types/users-update";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  daily_water_goal_ml: z.coerce.number().int().min(500).max(20000).optional(),
  height: z.coerce.number().min(50).max(280).optional(),
  target_weight: z.coerce.number().min(20).max(400).optional(),
});

type HealthSettingsPatch = z.infer<typeof patchSchema>;

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Unauthorized", 401);

    const { data, error } = await supabase
      .from("users")
      .select("daily_water_goal_ml, height, weight, target_weight")
      .eq("id", user.id)
      .single();

    if (error) return jsonError(error.message, 500);
    return jsonOk({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
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
    if (userError || !user) return jsonError("Unauthorized", 401);

    const body: unknown = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(" ") || "Invalid body", 400);
    }

    const patch: HealthSettingsPatch = parsed.data;
    if (Object.keys(patch).length === 0) {
      return jsonError("No valid fields", 400);
    }

    const updateData: HealthSettingsUsersUpdate = patch;

    const { error } = await supabase.from("users").update(updateData).eq("id", user.id);
    if (error) return jsonError(error.message, 500);
    return jsonOk({ data: patch });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

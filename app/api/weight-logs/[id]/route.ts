import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { deleteWeightLog, updateWeightLog } from "@/services/weight-logs";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Unauthorized", 401);

    const body = (await request.json()) as { weight?: unknown };
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
      return jsonError("weight invalid", 400);
    }

    const row = await updateWeightLog(supabase, user.id, id, weight);
    return jsonOk({ data: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Unauthorized", 401);

    await deleteWeightLog(supabase, user.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

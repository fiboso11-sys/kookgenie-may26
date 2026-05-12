import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { deleteWaterLog, updateWaterLog } from "@/services/water-logs";

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

    const body = (await request.json()) as { amount_ml?: unknown };
    const amount = Number(body.amount_ml);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000 || !Number.isInteger(amount)) {
      return jsonError("amount_ml invalid", 400);
    }

    const row = await updateWaterLog(supabase, user.id, id, amount);
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

    await deleteWaterLog(supabase, user.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

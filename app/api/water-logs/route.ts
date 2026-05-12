import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { createWaterLog, listWaterLogs } from "@/services/water-logs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const limitRaw = searchParams.get("limit");
    const limitParsed = limitRaw ? Number.parseInt(limitRaw, 10) : NaN;
    const limit =
      limitRaw && Number.isFinite(limitParsed) && limitParsed > 0 ? limitParsed : undefined;

    const data = await listWaterLogs(supabase, user.id, { from, to, limit });
    return jsonOk({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
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
    if (userError || !user) return jsonError("Unauthorized", 401);

    const body = (await request.json()) as { amount_ml?: unknown };
    const amount = Number(body.amount_ml);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000 || !Number.isInteger(amount)) {
      return jsonError("amount_ml must be a positive integer up to 5000", 400);
    }

    const row = await createWaterLog(supabase, user.id, amount);
    return jsonOk({ data: row }, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

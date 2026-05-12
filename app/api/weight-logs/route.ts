import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import { createWeightLog, listWeightLogs } from "@/services/weight-logs";

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

    const data = await listWeightLogs(supabase, user.id, { from, to, limit });
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

    const body = (await request.json()) as { weight?: unknown };
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 500) {
      return jsonError("weight must be a number (kg) between 0 and 500", 400);
    }

    const row = await createWeightLog(supabase, user.id, weight);
    return jsonOk({ data: row }, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return jsonError(message, 500);
  }
}

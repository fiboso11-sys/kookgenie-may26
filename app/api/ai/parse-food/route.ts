import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/json";
import { findLocalFoodMatches } from "@/lib/ai/nutrition-parser";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return jsonError("Unauthorized", 401);

    let body: { query?: string };
    try {
      body = (await request.json()) as { query?: string };
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length < 2) return jsonError("query is too short", 400);
    if (query.length > 500) return jsonError("query is too long", 400);

    const localMatches = await findLocalFoodMatches(supabase, user.id, query).catch(() => []);

    return NextResponse.json(
      {
        success: false as const,
        fallback: true as const,
        message: "AI temporarily disabled",
        source: "local_only" as const,
        items: [] as const,
        localMatches,
      },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return NextResponse.json(
      { success: false as const, fallback: true as const, message: "AI temporarily disabled", source: "local_only" as const, items: [] as const, localMatches: [] },
      { status: 200 },
    );
  }
}

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/json";

export const dynamic = "force-dynamic";

const BODY = { success: false as const, fallback: true as const, message: "AI temporarily disabled" };

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Unauthorized", 401);
    return NextResponse.json(BODY, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("Missing NEXT_PUBLIC_SUPABASE")) return jsonError("Supabase is not configured", 503);
    return NextResponse.json(BODY, { status: 200 });
  }
}

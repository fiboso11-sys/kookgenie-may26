import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOptionalServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

function bypassEnabled(): boolean {
  const v = process.env.KG_AUTH_BYPASS_ENABLED?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function readTokenAndEmail(request: Request, formData: FormData | null) {
  const url = new URL(request.url);
  const qToken = url.searchParams.get("token")?.trim() ?? "";
  const qEmail = url.searchParams.get("email")?.trim() ?? "";
  const qNext = url.searchParams.get("next")?.trim() ?? "";

  const fToken = (formData?.get("token") as string | null)?.trim() ?? "";
  const fEmail = (formData?.get("email") as string | null)?.trim() ?? "";
  const fNext = (formData?.get("next") as string | null)?.trim() ?? "";

  return {
    token: fToken || qToken,
    email: fEmail || qEmail,
    next: fNext || qNext || "/home",
  };
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Emergency sign-in without opening the magic link email.
 * Requires `KG_AUTH_BYPASS_ENABLED=true`, matching `KG_AUTH_BYPASS_TOKEN`, and `SUPABASE_SERVICE_ROLE_KEY`.
 *
 * GET or POST (form): token + email (+ optional next). POST avoids putting the token in server access logs as often.
 */
async function handleBypass(request: Request, formData: FormData | null) {
  const { origin } = new URL(request.url);

  if (!bypassEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expected = process.env.KG_AUTH_BYPASS_TOKEN?.trim() ?? "";
  if (!expected) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
  }

  const { token, email: rawEmail, next: rawNext } = readTokenAndEmail(request, formData);
  if (token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email =
    rawEmail ||
    process.env.KG_AUTH_BYPASS_EMAIL?.trim() ||
    "";
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Invalid or missing email" }, { status: 400 });
  }

  const next = rawNext.startsWith("/") ? rawNext : `/${rawNext}`;

  const admin = getOptionalServiceRoleSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for bypass sign-in" },
      { status: 503 },
    );
  }

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (linkErr || !linkData?.properties?.email_otp) {
    return NextResponse.json(
      { error: linkErr?.message ?? "Could not issue sign-in token" },
      { status: 502 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    email,
    token: linkData.properties.email_otp,
    type: "email",
  });

  if (verifyErr) {
    return NextResponse.json({ error: verifyErr.message }, { status: 401 });
  }

  return NextResponse.redirect(`${origin}${next}`);
}

export async function GET(request: Request) {
  try {
    return await handleBypass(request, null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bypass failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ct = request.headers.get("content-type") ?? "";
    let form: FormData | null = null;
    if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
      form = await request.formData();
    }
    return await handleBypass(request, form);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bypass failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

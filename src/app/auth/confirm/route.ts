import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles email-link verification for invites, password recovery and
 * email confirmations. Supports both the token_hash flow (recommended,
 * via customized email templates) and the ?code= exchange flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // Only allow same-site paths as a redirect target ("/x", not "//host" or
  // absolute URLs), so a crafted link can't send users to another site.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

  const supabase = await createClient();
  let verified = false;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }

  if (verified) {
    // New users (invite / recovery) must set a password first.
    const dest =
      type === "invite" || type === "recovery"
        ? "/accept-invite"
        : (next ?? "/events");
    return NextResponse.redirect(`${origin}${dest}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route-level access: unauthenticated users are sent to /login, and
 * authenticated users are kept away from /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getClaims().
  // getClaims() verifies the JWT locally (no auth-server round trip on
  // projects with asymmetric signing keys) and still refreshes expired
  // sessions.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const path = request.nextUrl.pathname;
  const isPublic = path === "/login" || path.startsWith("/auth");

  const redirectTo = (pathname: string, withFrom = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (withFrom) url.searchParams.set("redirectedFrom", path);
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed auth cookies onto the redirect response.
    response.cookies
      .getAll()
      .forEach((cookie) =>
        redirect.cookies.set(cookie.name, cookie.value, cookie),
      );
    return redirect;
  };

  if (!user && !isPublic) {
    return redirectTo("/login", true);
  }

  if (user && path === "/login") {
    return redirectTo("/events");
  }

  return response;
}

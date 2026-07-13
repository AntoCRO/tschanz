import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

export type AuthUser = { id: string; email: string | null };

export type AuthContext = {
  user: AuthUser;
  profile: Profile | null;
};

/**
 * Data Access Layer: returns the current user + profile, or null.
 * Memoized per-request with React cache().
 *
 * getClaims() verifies the JWT locally (asymmetric signing keys) instead
 * of calling the Supabase Auth server on every request; on projects with
 * legacy symmetric keys it falls back to a server check automatically.
 */
export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    user: { id: claims.sub, email: claims.email ?? null },
    profile,
  };
});

/** Require an authenticated user or redirect to /login. */
export async function requireUser(): Promise<AuthContext> {
  const ctx = await getAuth();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Require an admin or redirect away. */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") redirect("/events");
  return ctx;
}

export function isAdmin(ctx: AuthContext | null): boolean {
  return ctx?.profile?.role === "admin";
}

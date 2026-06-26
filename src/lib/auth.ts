import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

export type AuthContext = {
  user: User;
  profile: Profile | null;
};

/**
 * Data Access Layer: returns the current user + profile, or null.
 * Memoized per-request with React cache().
 */
export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
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

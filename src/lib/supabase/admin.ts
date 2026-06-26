import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Privileged Supabase client using the SECRET (service_role) key.
 * SERVER-ONLY: never import this into a Client Component.
 * Used for admin operations such as inviting users by email.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. Add the Supabase secret (service_role) key to .env.local to enable invites.",
    );
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

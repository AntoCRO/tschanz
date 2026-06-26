"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerT } from "@/lib/locale";

export type InviteState = { error?: string; message?: string } | undefined;

export async function inviteTeamMember(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: t("invite.emailInvalid") };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: t("invite.notConfigured") };
  }

  const h = await headers();
  const origin =
    h.get("origin") ??
    (h.get("host") ? `https://${h.get("host")}` : "http://localhost:3000");

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/confirm`,
  });
  if (error) {
    return { error: t("invite.failed", { msg: error.message }) };
  }

  revalidatePath("/admin/team");
  return { message: t("invite.sent", { email }) };
}

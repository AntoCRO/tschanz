"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";

export type AuthActionState = { error: string } | undefined;

export async function login(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getServerT();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: t("err.credentials") };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("not confirmed")) {
      return { error: t("err.emailNotConfirmed") };
    }
    if (msg.includes("invalid login")) {
      return { error: t("err.loginFailed") };
    }
    return { error: t("err.loginGeneric", { msg: error.message }) };
  }

  redirect("/events");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function acceptInvite(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getServerT();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName) return { error: t("err.nameRequired") };
  if (password.length < 8) return { error: t("err.passwordMin") };
  if (password !== confirm) return { error: t("err.passwordMismatch") };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({
    password,
    data: { full_name: fullName },
  });
  if (error) {
    return { error: t("err.accountSetup", { msg: error.message }) };
  }

  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);

  redirect("/events");
}

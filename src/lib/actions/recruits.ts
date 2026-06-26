"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getServerT } from "@/lib/locale";

export type RecruitFormState = { error?: string; ok?: boolean } | undefined;

const VALID_LANGS = new Set(["de", "fr"]);

export async function createRecruit(
  _prev: RecruitFormState,
  formData: FormData,
): Promise<RecruitFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const name = String(formData.get("name") ?? "").trim();
  const language = String(formData.get("language") ?? "");
  if (!name) return { error: t("err.nameReq") };
  if (!VALID_LANGS.has(language)) return { error: t("err.chooseLang") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("recruits")
    .insert({ name, language, created_by: ctx.user.id });
  if (error) return { error: error.message };

  revalidatePath("/admin/recruits");
  return { ok: true };
}

export async function updateRecruit(
  _prev: RecruitFormState,
  formData: FormData,
): Promise<RecruitFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const language = String(formData.get("language") ?? "");
  if (!id) return { error: t("err.invalidRecruit") };
  if (!name) return { error: t("err.nameReq") };
  if (!VALID_LANGS.has(language)) return { error: t("err.chooseLang") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("recruits")
    .update({ name, language })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/recruits");
  return { ok: true };
}

export async function setRecruitActive(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  const is_active = String(formData.get("is_active") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("recruits").update({ is_active }).eq("id", id);
  revalidatePath("/admin/recruits");
}

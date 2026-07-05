"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getServerT } from "@/lib/locale";

export type SidequestFormState = { error?: string; ok?: boolean } | undefined;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

export async function createSidequest(
  _prev: SidequestFormState,
  formData: FormData,
): Promise<SidequestFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const due_date = String(formData.get("due_date") ?? "");
  const due_time = String(formData.get("due_time") ?? "");
  if (!title) return { error: t("err.sqTitleReq") };
  if (!DATE_RE.test(due_date) || !TIME_RE.test(due_time)) {
    return { error: t("err.sqDueReq") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sidequests").insert({
    title,
    description: description || null,
    due_date,
    due_time,
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/sidequests");
  return { ok: true };
}

export async function toggleSidequest(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sidequests")
    .update({ done })
    .eq("id", id);
  if (error) console.error("toggleSidequest failed:", error.message);
  revalidatePath("/sidequests");
}

export async function deleteSidequest(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("sidequests").delete().eq("id", id);
  if (error) {
    console.error("deleteSidequest failed:", error.message);
    throw new Error(error.message);
  }
  revalidatePath("/sidequests");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getServerT } from "@/lib/locale";

export type EventFormState = { error?: string; ok?: boolean } | undefined;

function parseChef(formData: FormData): string | null {
  const raw = String(formData.get("chef_id") ?? "").trim();
  return raw ? raw : null;
}

export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "");
  const chef_id = parseChef(formData);
  if (!title || !event_date || !event_time) {
    return { error: t("err.titleDateTime") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .insert({ title, event_date, event_time, chef_id, created_by: ctx.user.id });
  if (error) return { error: error.message };

  revalidatePath("/events");
  return { ok: true };
}

export async function updateEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "");
  const event_time = String(formData.get("event_time") ?? "");
  const chef_id = parseChef(formData);
  if (!id) return { error: t("err.invalidEvent") };
  if (!title || !event_date || !event_time) {
    return { error: t("err.titleDateTime") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ title, event_date, event_time, chef_id })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  return { ok: true };
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/events");
}

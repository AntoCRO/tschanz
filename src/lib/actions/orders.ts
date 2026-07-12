"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuth } from "@/lib/auth";
import { getServerT } from "@/lib/locale";
import { ORDER_CATEGORIES, type OrderItem } from "@/lib/constants";

export type OrderFormState = { error?: string; ok?: boolean } | undefined;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

export async function createOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const t = await getServerT();
  const ctx = await getAuth();
  if (!ctx) return { error: t("err.notAllowed") };

  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const needed_date = String(formData.get("needed_date") ?? "");
  const needed_time = String(formData.get("needed_time") ?? "");
  const quantities = formData.getAll("item_quantity").map(String);
  const names = formData.getAll("item_name").map(String);

  if (!(ORDER_CATEGORIES as readonly string[]).includes(category)) {
    return { error: t("err.orderCatReq") };
  }

  const items: OrderItem[] = [];
  for (let i = 0; i < Math.max(quantities.length, names.length); i++) {
    const name = (names[i] ?? "").trim();
    const rawQty = (quantities[i] ?? "").trim();
    if (!name && !rawQty) continue; // fully empty row — ignore
    const quantity = Number(rawQty);
    if (!name || !Number.isInteger(quantity) || quantity < 1) {
      return { error: t("err.orderItems") };
    }
    items.push({ quantity, name });
  }
  if (items.length === 0) return { error: t("err.orderItems") };

  if (!DATE_RE.test(needed_date) || !TIME_RE.test(needed_time)) {
    return { error: t("err.orderDueReq") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("orders").insert({
    category,
    items,
    description: description || null,
    needed_date,
    needed_time,
    created_by: ctx.user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/bestellungen");
  return { ok: true };
}

export async function toggleOrder(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  const patch = done
    ? {
        done: true,
        completed_by: ctx.user.id,
        completed_at: new Date().toISOString(),
      }
    : { done: false, completed_by: null, completed_at: null };
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) console.error("toggleOrder failed:", error.message);
  revalidatePath("/bestellungen");
}

export async function deleteOrder(formData: FormData): Promise<void> {
  const ctx = await getAuth();
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    console.error("deleteOrder failed:", error.message);
    throw new Error(error.message);
  }
  revalidatePath("/bestellungen");
}

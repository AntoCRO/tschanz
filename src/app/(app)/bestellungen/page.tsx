import { requireUser, isAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { OrderManager } from "@/components/OrderManager";
import type { OrderCategory, OrderItem } from "@/lib/constants";

type OrderRaw = {
  id: string;
  category: OrderCategory;
  items: OrderItem[];
  description: string | null;
  needed_date: string;
  needed_time: string;
  done: boolean;
  created_at: string;
  completed_at: string | null;
  creator: { full_name: string | null; email: string | null } | null;
  completer: { full_name: string | null; email: string | null } | null;
};

export default async function BestellungenPage() {
  const ctx = await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

  const [{ data: ordersRaw }, { data: membersData }, { data: respData }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, category, items, description, needed_date, needed_time, done, created_at, completed_at, creator:profiles!orders_created_by_fkey(full_name, email), completer:profiles!orders_completed_by_fkey(full_name, email)",
        )
        .order("done", { ascending: true })
        .order("needed_date", { ascending: true })
        .order("needed_time", { ascending: true }),
      supabase.from("profiles").select("id, full_name, email").order("full_name"),
      supabase.from("order_responsibles").select("category, profile_id"),
    ]);

  const rows = (ordersRaw ?? []) as unknown as OrderRaw[];
  const orders = rows.map((o) => ({
    id: o.id,
    category: o.category,
    items: Array.isArray(o.items) ? o.items : [],
    description: o.description,
    needed_date: o.needed_date,
    needed_time: o.needed_time,
    done: o.done,
    created_at: o.created_at,
    completed_at: o.completed_at,
    creatorName: o.creator?.full_name || o.creator?.email || null,
    completerName: o.completer?.full_name || o.completer?.email || null,
  }));

  const members = (membersData ?? []).map((m) => ({
    id: m.id,
    name: m.full_name || m.email || "—",
  }));

  const responsibles: Record<string, string> = {};
  for (const r of respData ?? []) responsibles[r.category] = r.profile_id;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("orders.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("orders.subtitle")}</p>
      </div>
      <OrderManager
        orders={orders}
        members={members}
        responsibles={responsibles}
        isAdmin={isAdmin(ctx)}
        myId={ctx.user.id}
      />
    </div>
  );
}

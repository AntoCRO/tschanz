import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { EventsManager } from "@/components/EventsManager";

type EventRaw = {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  chef_id: string | null;
  chef: { full_name: string | null; email: string | null } | null;
};

export default async function EventsPage() {
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

  const { data: eventsRaw } = await supabase
    .from("events")
    .select(
      "id, title, event_date, event_time, chef_id, chef:profiles!events_chef_id_fkey(full_name, email)",
    )
    .order("event_date", { ascending: false })
    .order("event_time", { ascending: false });

  // Active recruits are the denominator (and the only ones that count).
  const { data: activeRecruits } = await supabase
    .from("recruits")
    .select("id")
    .eq("is_active", true);
  const activeIds = new Set((activeRecruits ?? []).map((r) => r.id));
  const recruitCount = activeIds.size;

  // Shared progress: count active recruits that have a rating — by ANYONE.
  const { data: scoredRatings } = await supabase
    .from("ratings")
    .select("event_id, recruit_id")
    .not("score", "is", null);

  const { data: membersData } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name");

  const ratedByEvent: Record<string, number> = {};
  for (const r of scoredRatings ?? []) {
    if (!activeIds.has(r.recruit_id)) continue;
    ratedByEvent[r.event_id] = (ratedByEvent[r.event_id] ?? 0) + 1;
  }

  const rows = (eventsRaw ?? []) as unknown as EventRaw[];
  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    event_time: e.event_time,
    chef_id: e.chef_id,
    chefName: e.chef?.full_name || e.chef?.email || null,
    done: ratedByEvent[e.id] ?? 0,
    total: recruitCount,
  }));

  const members = (membersData ?? []).map((m) => ({
    id: m.id,
    name: m.full_name || m.email || "—",
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("events.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("events.subtitle")}</p>
      </div>
      <EventsManager events={events} members={members} />
    </div>
  );
}

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

  // One round trip: the event_progress view aggregates "covered" recruits
  // (rated by anyone OR marked absent) per Lektion in the database.
  const [
    { data: eventsRaw },
    { count: recruitCount },
    { data: progressRows },
    { data: membersData },
  ] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, event_date, event_time, chef_id, chef:profiles!events_chef_id_fkey(full_name, email)",
      )
      .order("event_date", { ascending: false })
      .order("event_time", { ascending: false }),
    supabase
      .from("recruits")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("event_progress").select("event_id, covered"),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name"),
  ]);

  const coveredByEvent = new Map(
    (progressRows ?? []).map((p) => [p.event_id, p.covered ?? 0]),
  );

  const rows = (eventsRaw ?? []) as unknown as EventRaw[];
  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    event_date: e.event_date,
    event_time: e.event_time,
    chef_id: e.chef_id,
    chefName: e.chef?.full_name || e.chef?.email || null,
    done: coveredByEvent.get(e.id) ?? 0,
    total: recruitCount ?? 0,
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

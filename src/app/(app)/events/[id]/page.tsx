import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { EventRating } from "@/components/EventRating";
import { formatEventDateTime } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

  // Shared ratings: load everyone's (one per recruit), not just the current user's.
  const [{ data: event }, { data: recruits }, { data: ratings }, { data: attendance }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, title, event_date, event_time")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("recruits")
        .select("id, name, language")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("ratings")
        .select("recruit_id, score, bemerkungen")
        .eq("event_id", id),
      supabase
        .from("attendance")
        .select("recruit_id, present")
        .eq("event_id", id),
    ]);
  if (!event) notFound();

  const initialRatings: Record<
    string,
    { score: number | null; bemerkungen: string }
  > = {};
  for (const r of ratings ?? []) {
    initialRatings[r.recruit_id] = {
      score: r.score,
      bemerkungen: r.bemerkungen ?? "",
    };
  }

  const initialAttendance: Record<string, boolean> = {};
  for (const a of attendance ?? []) {
    initialAttendance[a.recruit_id] = a.present;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/events" className="text-sm text-slate-500 hover:underline">
          {t("common.backToEvents")}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {event.title}
        </h1>
        <p className="text-sm text-slate-500">
          {formatEventDateTime(event.event_date, event.event_time)}
        </p>
      </div>

      {(recruits ?? []).length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("bewerten.noRecruits")}
        </p>
      ) : (
        <EventRating
          eventId={id}
          userId={ctx.user.id}
          recruits={recruits ?? []}
          initialRatings={initialRatings}
          initialAttendance={initialAttendance}
        />
      )}
    </div>
  );
}

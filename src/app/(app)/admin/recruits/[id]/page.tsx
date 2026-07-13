import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { Badge, Card } from "@/components/ui";
import { Flag } from "@/components/Flag";
import { ExportButtons, type CsvRow } from "@/components/ExportButtons";
import { formatEventDate, formatEventDateTime } from "@/lib/utils";
import { ratingLabel } from "@/lib/constants";

type RatingRaw = {
  event_id: string;
  score: number | null;
  bemerkungen: string | null;
  evaluator: { full_name: string | null; email: string | null } | null;
};

export default async function RecruitProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

  const { data: recruit } = await supabase
    .from("recruits")
    .select("id, name, language, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!recruit) notFound();

  const [{ data: events }, { data: ratingsRaw }, { data: attendance }] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, title, event_date, event_time")
        .order("event_date", { ascending: false })
        .order("event_time", { ascending: false }),
      supabase
        .from("ratings")
        .select(
          "event_id, score, bemerkungen, evaluator:profiles!ratings_evaluator_id_fkey(full_name, email)",
        )
        .eq("recruit_id", id),
      supabase
        .from("attendance")
        .select("event_id, present")
        .eq("recruit_id", id),
    ]);

  const ratings = (ratingsRaw ?? []) as unknown as RatingRaw[];
  const ratingsByEvent = new Map<string, RatingRaw[]>();
  for (const r of ratings) {
    const arr = ratingsByEvent.get(r.event_id) ?? [];
    arr.push(r);
    ratingsByEvent.set(r.event_id, arr);
  }
  const presenceByEvent = new Map<string, boolean>();
  for (const a of attendance ?? []) presenceByEvent.set(a.event_id, a.present);

  // Only Lektionen where this recruit left a trace (rating or attendance).
  const lessons = (events ?? [])
    .filter((e) => ratingsByEvent.has(e.id) || presenceByEvent.has(e.id))
    .map((e) => {
      const rs = ratingsByEvent.get(e.id) ?? [];
      const scored = rs
        .map((r) => r.score)
        .filter((s): s is number => s !== null);
      return {
        ...e,
        ratings: rs,
        avg:
          scored.length > 0
            ? scored.reduce((a, b) => a + b, 0) / scored.length
            : null,
        count: scored.length,
        absent: presenceByEvent.get(e.id) === false,
      };
    });

  const allScores = ratings
    .map((r) => r.score)
    .filter((s): s is number => s !== null);
  const overallAvg =
    allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : null;
  const absences = [...presenceByEvent.values()].filter((p) => !p).length;

  // CSV: one row per rating; Lektionen without ratings get a single row.
  const csvRows: CsvRow[] = [
    [
      t("field.date"),
      t("field.time"),
      t("export.lesson"),
      t("export.attendance"),
      t("role.evaluator"),
      t("export.score"),
      t("bewerten.remarksHeader"),
    ],
  ];
  for (const l of lessons) {
    const att = l.absent
      ? t("attendance.absent")
      : presenceByEvent.has(l.id)
        ? t("attendance.present")
        : "";
    const base = [
      formatEventDate(l.event_date),
      l.event_time.slice(0, 5),
      l.title,
      att,
    ];
    if (l.ratings.length === 0) {
      csvRows.push([...base, "", "", ""]);
    } else {
      for (const r of l.ratings) {
        csvRows.push([
          ...base,
          r.evaluator?.full_name || r.evaluator?.email || "",
          ratingLabel(r.score),
          r.bemerkungen ?? "",
        ]);
      }
    }
  }
  const filename = `rekrut-${recruit.name.toLowerCase().replace(/[^a-z0-9äöüéèà]+/gi, "-")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/recruits"
            className="text-sm text-slate-500 hover:underline print:hidden"
          >
            {t("common.backToRecruits")}
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            {recruit.name}
            <Flag lang={recruit.language} />
          </h1>
          <p className="text-sm text-slate-500">{t("profile.subtitle")}</p>
        </div>
        <ExportButtons filename={filename} rows={csvRows} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {overallAvg !== null ? overallAvg.toFixed(1) : t("common.dash")}
          </p>
          <p className="text-xs text-slate-500">{t("profile.avg")}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">
            {allScores.length}
          </p>
          <p className="text-xs text-slate-500">{t("profile.ratingsCount")}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-semibold text-slate-900">{absences}</p>
          <p className="text-xs text-slate-500">{t("profile.absences")}</p>
        </Card>
      </div>

      {lessons.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("profile.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {lessons.map((l) => (
            <li key={l.id}>
              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {l.title}
                      </span>
                      {l.absent && (
                        <Badge className="bg-red-100 text-red-700">
                          {t("attendance.absent")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatEventDateTime(l.event_date, l.event_time)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {l.avg !== null ? (
                      <span className="text-lg font-semibold text-slate-900">
                        {l.avg.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        {t("common.dash")}
                      </span>
                    )}
                    <span className="ml-2 text-xs text-slate-400">
                      {l.count === 1
                        ? t("results.ratingOne", { count: l.count })
                        : t("results.ratingMany", { count: l.count })}
                    </span>
                  </div>
                </div>
                {l.ratings.length > 0 && (
                  <ul className="mt-3 border-t border-slate-100">
                    {l.ratings.map((r, i) => (
                      <li
                        key={i}
                        className="flex gap-3 border-b border-slate-50 py-2 text-sm last:border-0"
                      >
                        <span className="w-32 shrink-0 truncate text-slate-500">
                          {r.evaluator?.full_name || r.evaluator?.email || "—"}
                        </span>
                        <span className="w-8 shrink-0 text-center font-semibold text-slate-900">
                          {ratingLabel(r.score)}
                        </span>
                        <span className="text-slate-700">{r.bemerkungen}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

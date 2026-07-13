import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getServerT } from "@/lib/locale";
import { Badge, Card } from "@/components/ui";
import { Flag } from "@/components/Flag";
import { ExportButtons, type CsvRow } from "@/components/ExportButtons";
import { formatEventDate, formatEventDateTime } from "@/lib/utils";
import { languageShort, ratingLabel } from "@/lib/constants";

type RatingRow = {
  recruit_id: string;
  score: number | null;
  bemerkungen: string | null;
  evaluator: { full_name: string | null; email: string | null } | null;
};

function formatAvg(avg: number): string {
  // Grade-style average on the 1..5 scale.
  return avg.toFixed(1);
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();
  const t = await getServerT();
  const supabase = await createClient();

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
        .select(
          "recruit_id, score, bemerkungen, evaluator:profiles!ratings_evaluator_id_fkey(full_name, email)",
        )
        .eq("event_id", id),
      supabase
        .from("attendance")
        .select("recruit_id, present")
        .eq("event_id", id),
    ]);
  if (!event) notFound();
  const presenceByRecruit = new Map<string, boolean>();
  for (const a of attendance ?? [])
    presenceByRecruit.set(a.recruit_id, a.present);

  const rows = (ratings ?? []) as unknown as RatingRow[];
  const byRecruit = new Map<string, RatingRow[]>();
  for (const r of rows) {
    const arr = byRecruit.get(r.recruit_id) ?? [];
    arr.push(r);
    byRecruit.set(r.recruit_id, arr);
  }

  // CSV export: one row per rating; recruits without ratings get one row.
  const csvRows: CsvRow[] = [
    [
      t("export.recruit"),
      t("field.language"),
      t("export.attendance"),
      t("role.evaluator"),
      t("export.score"),
      t("bewerten.remarksHeader"),
    ],
  ];
  for (const rec of recruits ?? []) {
    const present = presenceByRecruit.get(rec.id);
    const att =
      present === false
        ? t("attendance.absent")
        : present === true
          ? t("attendance.present")
          : "";
    const base = [rec.name, languageShort(rec.language), att];
    const rs = byRecruit.get(rec.id) ?? [];
    if (rs.length === 0) {
      csvRows.push([...base, "", "", ""]);
    } else {
      for (const r of rs) {
        csvRows.push([
          ...base,
          r.evaluator?.full_name || r.evaluator?.email || "",
          ratingLabel(r.score),
          r.bemerkungen ?? "",
        ]);
      }
    }
  }
  const filename = `auswertung-${event.title.toLowerCase().replace(/[^a-z0-9äöüéèà]+/gi, "-")}-${formatEventDate(event.event_date).replace(/\./g, "-")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-slate-500 hover:underline print:hidden"
          >
            {t("common.backToEvents")}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {t("results.titlePrefix", { title: event.title })}
          </h1>
          <p className="text-sm text-slate-500">
            {formatEventDateTime(event.event_date, event.event_time)}
          </p>
        </div>
        <ExportButtons filename={filename} rows={csvRows} />
      </div>

      {(recruits ?? []).length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("bewerten.noRecruits")}
        </p>
      ) : (
        <ul className="space-y-3">
          {(recruits ?? []).map((rec) => {
            const rs = byRecruit.get(rec.id) ?? [];
            const scored = rs
              .map((r) => r.score)
              .filter((s): s is number => s !== null);
            const avg =
              scored.length > 0
                ? scored.reduce((a, b) => a + b, 0) / scored.length
                : null;
            const countLabel =
              scored.length === 1
                ? t("results.ratingOne", { count: scored.length })
                : t("results.ratingMany", { count: scored.length });

            return (
              <li key={rec.id}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {rec.name}
                      </span>
                      <Flag lang={rec.language} />
                      {presenceByRecruit.get(rec.id) === false && (
                        <Badge className="bg-red-100 text-red-700">
                          {t("attendance.absent")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      {avg !== null ? (
                        <span className="text-lg font-semibold text-slate-900">
                          {formatAvg(avg)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          {t("common.dash")}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-slate-400">
                        {countLabel}
                      </span>
                    </div>
                  </div>

                  {rs.length > 0 && (
                    <ul className="mt-3 border-t border-slate-100">
                      {rs.map((r, i) => (
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
                          <span className="text-slate-700">
                            {r.bemerkungen}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

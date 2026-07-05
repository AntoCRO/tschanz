"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RatingSelector } from "@/components/RatingSelector";
import { Card, Input, Select, Textarea } from "@/components/ui";
import { Flag } from "@/components/Flag";
import { useLanguage } from "@/components/LanguageProvider";
import { LANGUAGES } from "@/lib/constants";
import { recruitLangLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Recruit = { id: string; name: string; language: string };
type SaveStatus = "idle" | "saving" | "saved" | "error";
type Entry = {
  score: number | null;
  bemerkungen: string;
  ratingStatus: SaveStatus;
  present: boolean | null;
  attStatus: SaveStatus;
};

function combine(a: SaveStatus, b: SaveStatus): SaveStatus {
  if (a === "error" || b === "error") return "error";
  if (a === "saving" || b === "saving") return "saving";
  if (a === "saved" || b === "saved") return "saved";
  return "idle";
}

export function EventRating({
  eventId,
  userId,
  recruits,
  initialRatings,
  initialAttendance,
}: {
  eventId: string;
  userId: string;
  recruits: Recruit[];
  initialRatings: Record<string, { score: number | null; bemerkungen: string }>;
  initialAttendance: Record<string, boolean>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const { t, locale } = useLanguage();

  const buildInitial = (): Record<string, Entry> => {
    const s: Record<string, Entry> = {};
    for (const r of recruits) {
      const ir = initialRatings[r.id];
      const present = initialAttendance[r.id];
      s[r.id] = {
        score: ir?.score ?? null,
        bemerkungen: ir?.bemerkungen ?? "",
        ratingStatus: "idle",
        present: present === undefined ? null : present,
        attStatus: "idle",
      };
    }
    return s;
  };

  const [state, setState] = useState<Record<string, Entry>>(buildInitial);
  const stateRef = useRef(state);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"all" | "de" | "fr">("all");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Recruits currently being edited locally (don't let live updates clobber them).
  const editing = useRef<Record<string, boolean>>({});

  const patch = useCallback((recruitId: string, partial: Partial<Entry>) => {
    if (!stateRef.current[recruitId]) return;
    const nextEntry = { ...stateRef.current[recruitId], ...partial };
    const nextState = { ...stateRef.current, [recruitId]: nextEntry };
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const saveRating = useCallback(
    async (
      recruitId: string,
      payload: { score: number | null; bemerkungen: string },
    ) => {
      patch(recruitId, { ratingStatus: "saving" });
      const row = {
        event_id: eventId,
        recruit_id: recruitId,
        evaluator_id: userId,
        score: payload.score,
        bemerkungen: payload.bemerkungen.trim() ? payload.bemerkungen : null,
      };
      // Preferred path: upsert on the shared (event_id, recruit_id) key.
      let { error } = await supabase
        .from("ratings")
        .upsert(row, { onConflict: "event_id,recruit_id" });
      // Fallback for a DB without that unique constraint: update-or-insert.
      if (error) {
        const { data: existing } = await supabase
          .from("ratings")
          .select("id")
          .eq("event_id", eventId)
          .eq("recruit_id", recruitId)
          .maybeSingle();
        ({ error } = existing
          ? await supabase.from("ratings").update(row).eq("id", existing.id)
          : await supabase.from("ratings").insert(row));
      }
      if (error) console.error("saveRating failed:", error.message);
      patch(recruitId, { ratingStatus: error ? "error" : "saved" });
      editing.current[recruitId] = false;
    },
    [supabase, eventId, userId, patch],
  );

  const saveAttendance = useCallback(
    async (recruitId: string, present: boolean) => {
      patch(recruitId, { attStatus: "saving", present });
      const row = {
        event_id: eventId,
        recruit_id: recruitId,
        present,
        updated_by: userId,
      };
      let { error } = await supabase
        .from("attendance")
        .upsert(row, { onConflict: "event_id,recruit_id" });
      if (error) {
        const { data: existing } = await supabase
          .from("attendance")
          .select("id")
          .eq("event_id", eventId)
          .eq("recruit_id", recruitId)
          .maybeSingle();
        ({ error } = existing
          ? await supabase.from("attendance").update(row).eq("id", existing.id)
          : await supabase.from("attendance").insert(row));
      }
      if (error) console.error("saveAttendance failed:", error.message);
      patch(recruitId, { attStatus: error ? "error" : "saved" });
    },
    [supabase, eventId, userId, patch],
  );

  const onScore = (recruitId: string, score: number) => {
    const cur = stateRef.current[recruitId];
    if (!cur) return;
    patch(recruitId, { score });
    void saveRating(recruitId, { score, bemerkungen: cur.bemerkungen });
  };

  const onBemerkungen = (recruitId: string, value: string) => {
    editing.current[recruitId] = true;
    patch(recruitId, { bemerkungen: value, ratingStatus: "idle" });
    clearTimeout(timers.current[recruitId]);
    timers.current[recruitId] = setTimeout(() => {
      const cur = stateRef.current[recruitId];
      void saveRating(recruitId, {
        score: cur.score,
        bemerkungen: cur.bemerkungen,
      });
    }, 600);
  };

  const onAttendance = (recruitId: string, present: boolean) => {
    void saveAttendance(recruitId, present);
  };

  // Live sync: apply other users' rating/attendance changes for this event.
  useEffect(() => {
    const ids = new Set(recruits.map((r) => r.id));
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ratings",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            recruit_id?: string;
            evaluator_id?: string;
            score?: number | null;
            bemerkungen?: string | null;
          };
          if (!row?.recruit_id || !ids.has(row.recruit_id)) return;
          if (row.evaluator_id === userId) return; // my own change
          if (editing.current[row.recruit_id]) return; // I'm editing this one
          patch(row.recruit_id, {
            score: row.score ?? null,
            bemerkungen: row.bemerkungen ?? "",
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const row = payload.new as {
            recruit_id?: string;
            updated_by?: string;
            present?: boolean;
          };
          if (!row?.recruit_id || !ids.has(row.recruit_id)) return;
          if (row.updated_by === userId) return; // my own change
          patch(row.recruit_id, { present: row.present ?? null });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, eventId, userId, recruits, patch]);

  const visible = recruits.filter(
    (r) =>
      (lang === "all" || r.language === lang) &&
      r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const ratedCount = Object.values(state).filter((s) => s.score !== null).length;
  const total = recruits.length;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {t("bewerten.rated", { done: ratedCount, total })}
          </span>
          <span className="text-slate-400">
            {t("bewerten.shown", { count: visible.length })}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: total ? `${(ratedCount / total) * 100}%` : "0%" }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder={t("bewerten.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10"
          />
          <Select
            value={lang}
            onChange={(e) => setLang(e.target.value as "all" | "de" | "fr")}
            className="h-10 w-32"
            aria-label={t("field.language")}
          >
            <option value="all">{t("filter.all")}</option>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {recruitLangLabel(locale, l.value)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("recruits.noMatch")}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => {
            const entry = state[r.id];
            const absent = entry.present === false;
            return (
              <li key={r.id}>
                <Card className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {r.name}
                      </span>
                      <Flag lang={r.language} />
                    </div>
                    <SaveBadge
                      status={combine(entry.ratingStatus, entry.attStatus)}
                      t={t}
                    />
                  </div>

                  <AttendanceToggle
                    present={entry.present}
                    onChange={(p) => onAttendance(r.id, p)}
                    presentLabel={t("attendance.present")}
                    absentLabel={t("attendance.absent")}
                  />

                  <div className={cn("mt-3", absent && "opacity-40")}>
                    <RatingSelector
                      value={entry.score}
                      onChange={(v) => onScore(r.id, v)}
                      disabled={absent}
                    />
                  </div>
                  <Textarea
                    className="mt-3"
                    rows={2}
                    placeholder={t("bewerten.remarks")}
                    value={entry.bemerkungen}
                    onChange={(e) => onBemerkungen(r.id, e.target.value)}
                  />
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AttendanceToggle({
  present,
  onChange,
  presentLabel,
  absentLabel,
}: {
  present: boolean | null;
  onChange: (present: boolean) => void;
  presentLabel: string;
  absentLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        aria-pressed={present === true}
        onClick={() => onChange(true)}
        className={cn(
          "h-9 rounded-lg border text-sm font-medium transition-colors",
          present === true
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
        )}
      >
        {presentLabel}
      </button>
      <button
        type="button"
        aria-pressed={present === false}
        onClick={() => onChange(false)}
        className={cn(
          "h-9 rounded-lg border text-sm font-medium transition-colors",
          present === false
            ? "border-red-600 bg-red-600 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
        )}
      >
        {absentLabel}
      </button>
    </div>
  );
}

function SaveBadge({
  status,
  t,
}: {
  status: SaveStatus;
  t: (key: "save.saving" | "save.saved" | "save.error") => string;
}) {
  if (status === "saving")
    return <span className="text-xs text-slate-400">{t("save.saving")}</span>;
  if (status === "saved")
    return <span className="text-xs text-emerald-600">{t("save.saved")}</span>;
  if (status === "error")
    return <span className="text-xs text-red-600">{t("save.error")}</span>;
  return <span className="text-xs text-transparent">·</span>;
}

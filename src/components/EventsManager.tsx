"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  type EventFormState,
} from "@/lib/actions/events";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { useT } from "@/components/LanguageProvider";
import { formatEventDateTime, isoWeekRange } from "@/lib/utils";

type Member = { id: string; name: string };

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  chef_id: string | null;
  chefName: string | null;
  done: number;
  total: number;
};

export function EventsManager({
  events,
  members,
}: {
  events: EventRow[];
  members: Member[];
}) {
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [day, setDay] = useState("");
  const [week, setWeek] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    const wr = week ? isoWeekRange(week) : null;
    return events
      .filter((e) =>
        e.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .filter((e) => !day || e.event_date === day)
      .filter((e) => !wr || (e.event_date >= wr.start && e.event_date <= wr.end))
      .slice()
      .sort((a, b) => {
        const ka = `${a.event_date}T${a.event_time}`;
        const kb = `${b.event_date}T${b.event_time}`;
        return sortDir === "asc" ? ka.localeCompare(kb) : kb.localeCompare(ka);
      });
  }, [events, search, day, week, sortDir]);

  const hasFilter = Boolean(search || day || week);

  return (
    <div className="space-y-4">
      {creating ? (
        <Card className="p-4">
          <h2 className="mb-3 font-medium text-slate-900">{t("events.new")}</h2>
          <EventForm
            mode="create"
            members={members}
            onDone={() => setCreating(false)}
          />
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)}>{t("events.newButton")}</Button>
      )}

      {/* Filters */}
      <Card className="space-y-2 p-3">
        <Input
          placeholder={t("events.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="sm:w-44">
            <Label htmlFor="ev-day">{t("filter.day")}</Label>
            <Input
              id="ev-day"
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="sm:w-44">
            <Label htmlFor="ev-week">{t("filter.week")}</Label>
            <Input
              id="ev-week"
              type="week"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="sm:w-52">
            <Label htmlFor="ev-sort">{t("filter.sort")}</Label>
            <Select
              id="ev-sort"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "desc" | "asc")}
              className="h-10"
            >
              <option value="desc">{t("filter.newest")}</option>
              <option value="asc">{t("filter.oldest")}</option>
            </Select>
          </div>
          {hasFilter && (
            <Button
              variant="ghost"
              className="h-10"
              onClick={() => {
                setSearch("");
                setDay("");
                setWeek("");
              }}
            >
              {t("filter.reset")}
            </Button>
          )}
        </div>
      </Card>

      {events.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("events.empty")}
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("events.noMatch")}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((ev) =>
            editingId === ev.id ? (
              <li key={ev.id}>
                <Card className="p-4">
                  <h2 className="mb-3 font-medium text-slate-900">
                    {t("events.edit")}
                  </h2>
                  <EventForm
                    mode="edit"
                    initial={ev}
                    members={members}
                    onDone={() => setEditingId(null)}
                  />
                </Card>
              </li>
            ) : (
              <li key={ev.id}>
                <Card className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/events/${ev.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {ev.title}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {formatEventDateTime(ev.event_date, ev.event_time)}
                        {ev.chefName
                          ? ` · ${t("events.chefPrefix")}: ${ev.chefName}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/events/${ev.id}`}>
                        <Button size="sm">{t("events.rate")}</Button>
                      </Link>
                      <Link href={`/events/${ev.id}/results`}>
                        <Button size="sm" variant="secondary">
                          {t("events.results")}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(ev.id)}
                      >
                        {t("common.edit")}
                      </Button>
                      <form
                        action={deleteEvent}
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              t("events.deleteConfirm", { title: ev.title }),
                            )
                          )
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={ev.id} />
                        <Button size="sm" variant="danger" type="submit">
                          <TrashIcon className="h-4 w-4" />
                          {t("common.delete")}
                        </Button>
                      </form>
                    </div>
                  </div>
                  <ProgressBar
                    done={ev.done}
                    total={ev.total}
                    label={t("events.progressLabel")}
                    countLabel={t("bewerten.rated", {
                      done: ev.done,
                      total: ev.total,
                    })}
                  />
                </Card>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function ProgressBar({
  done,
  total,
  label,
  countLabel,
}: {
  done: number;
  total: number;
  label: string;
  countLabel: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>
          {countLabel} · {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EventForm({
  mode,
  initial,
  members,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: EventRow;
  members: Member[];
  onDone: () => void;
}) {
  const t = useT();
  const action = mode === "create" ? createEvent : updateEvent;
  const [state, formAction, pending] = useActionState<EventFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      {mode === "edit" && <input type="hidden" name="id" value={initial!.id} />}
      <div>
        <Label htmlFor="title">{t("field.title")}</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initial?.title}
          required
          placeholder={t("events.titlePlaceholder")}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="event_date">{t("field.date")}</Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={initial?.event_date}
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="event_time">{t("field.time")}</Label>
          <Input
            id="event_time"
            name="event_time"
            type="time"
            defaultValue={initial?.event_time?.slice(0, 5)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="chef_id">{t("field.chef")}</Label>
        <Select id="chef_id" name="chef_id" defaultValue={initial?.chef_id ?? ""}>
          <option value="">{t("events.chefNone")}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {mode === "create" ? t("events.create") : t("common.save")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createSidequest,
  toggleSidequest,
  deleteSidequest,
  type SidequestFormState,
} from "@/lib/actions/sidequests";
import { Badge, Button, Card, Input, Label, Textarea } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { useT } from "@/components/LanguageProvider";
import { cn, formatEventDateTime } from "@/lib/utils";

type SidequestRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string;
  done: boolean;
};

function isOverdue(sq: SidequestRow): boolean {
  const due = new Date(`${sq.due_date}T${sq.due_time.slice(0, 5)}`);
  return !sq.done && due.getTime() < Date.now();
}

export function SidequestManager({
  sidequests,
}: {
  sidequests: SidequestRow[];
}) {
  const t = useT();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      {creating ? (
        <Card className="p-4">
          <h2 className="mb-3 font-medium text-slate-900">{t("sq.new")}</h2>
          <SidequestForm onDone={() => setCreating(false)} />
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)}>{t("sq.newButton")}</Button>
      )}

      {sidequests.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("sq.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {sidequests.map((sq) => {
            const overdue = isOverdue(sq);
            return (
              <li key={sq.id}>
                <Card className={cn("p-4", sq.done && "opacity-60")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "font-medium text-slate-900",
                            sq.done && "line-through",
                          )}
                        >
                          {sq.title}
                        </span>
                        {sq.done ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {t("sq.done")}
                          </Badge>
                        ) : overdue ? (
                          <Badge className="bg-red-100 text-red-700">
                            {t("sq.overdue")}
                          </Badge>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          "text-sm",
                          overdue ? "text-red-600" : "text-slate-500",
                        )}
                      >
                        {t("sq.dueLabel", {
                          datetime: formatEventDateTime(
                            sq.due_date,
                            sq.due_time,
                          ),
                        })}
                      </p>
                      {sq.description && (
                        <p className="mt-1 text-sm whitespace-pre-line text-slate-700">
                          {sq.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <form action={toggleSidequest}>
                        <input type="hidden" name="id" value={sq.id} />
                        <input
                          type="hidden"
                          name="done"
                          value={sq.done ? "false" : "true"}
                        />
                        <Button
                          size="sm"
                          variant={sq.done ? "ghost" : "secondary"}
                          type="submit"
                        >
                          {sq.done ? t("sq.markOpen") : t("sq.markDone")}
                        </Button>
                      </form>
                      <form
                        action={deleteSidequest}
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              t("sq.deleteConfirm", { title: sq.title }),
                            )
                          )
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={sq.id} />
                        <Button size="sm" variant="danger" type="submit">
                          <TrashIcon className="h-4 w-4" />
                          {t("common.delete")}
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SidequestForm({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [state, formAction, pending] = useActionState<
    SidequestFormState,
    FormData
  >(createSidequest, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="sq-title">{t("field.title")}</Label>
        <Input
          id="sq-title"
          name="title"
          required
          autoFocus
          placeholder={t("sq.titlePlaceholder")}
        />
      </div>
      <div>
        <Label htmlFor="sq-description">{t("field.description")}</Label>
        <Textarea
          id="sq-description"
          name="description"
          rows={3}
          placeholder={t("sq.descPlaceholder")}
        />
      </div>
      <div>
        <Label>{t("sq.dueBy")}</Label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              name="due_date"
              type="date"
              required
              aria-label={t("field.date")}
            />
          </div>
          <div className="flex-1">
            <Input
              name="due_time"
              type="time"
              required
              aria-label={t("field.time")}
            />
          </div>
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {t("sq.create")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

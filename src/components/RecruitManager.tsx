"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createRecruit,
  updateRecruit,
  setRecruitActive,
  type RecruitFormState,
} from "@/lib/actions/recruits";
import { Badge, Button, Input, Label, Select } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { Flag } from "@/components/Flag";
import { PencilIcon, StandDownIcon, ActivateIcon } from "@/components/icons";
import { useLanguage } from "@/components/LanguageProvider";
import { recruitLangLabel } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type RecruitRow = {
  id: string;
  name: string;
  language: string;
  is_active: boolean;
};

type FormMode =
  | { mode: "create" }
  | { mode: "edit"; recruit: RecruitRow }
  | null;

export function RecruitManager({ recruits }: { recruits: RecruitRow[] }) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"all" | "de" | "fr">("all");
  const [form, setForm] = useState<FormMode>(null);

  const visible = recruits.filter(
    (r) =>
      (lang === "all" || r.language === lang) &&
      r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: search + filter + add (top-right) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder={t("recruits.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Select
            value={lang}
            onChange={(e) => setLang(e.target.value as "all" | "de" | "fr")}
            className="w-32"
            aria-label={t("field.language")}
          >
            <option value="all">{t("filter.all")}</option>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {recruitLangLabel(locale, l.value)}
              </option>
            ))}
          </Select>
          <Button
            className="whitespace-nowrap"
            onClick={() => setForm({ mode: "create" })}
          >
            {t("recruits.add")}
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {t("recruits.count", { shown: visible.length, total: recruits.length })}
      </p>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {recruits.length === 0 ? t("recruits.empty") : t("recruits.noMatch")}
        </p>
      ) : (
        <ol className="space-y-2">
          {visible.map((r, i) => (
            <li key={r.id}>
              <div
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
                  !r.is_active && "opacity-60",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-right text-sm tabular-nums text-slate-400">
                    {i + 1}.
                  </span>
                  <span className="truncate font-medium text-slate-900">
                    {r.name}
                  </span>
                  <Flag lang={r.language} />
                  {!r.is_active && (
                    <Badge className="bg-amber-100 text-amber-700">
                      {t("recruits.inactive")}
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setForm({ mode: "edit", recruit: r })}
                    aria-label={t("common.edit")}
                    title={t("common.edit")}
                  >
                    <PencilIcon />
                  </Button>
                  <form action={setRecruitActive}>
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      type="hidden"
                      name="is_active"
                      value={(!r.is_active).toString()}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      type="submit"
                      aria-label={
                        r.is_active
                          ? t("recruits.deactivate")
                          : t("recruits.activate")
                      }
                      title={
                        r.is_active
                          ? t("recruits.deactivate")
                          : t("recruits.activate")
                      }
                    >
                      {/* Icon on phones, text on larger screens */}
                      <span className="sm:hidden">
                        {r.is_active ? <StandDownIcon /> : <ActivateIcon />}
                      </span>
                      <span className="hidden sm:inline">
                        {r.is_active
                          ? t("recruits.deactivate")
                          : t("recruits.activate")}
                      </span>
                    </Button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={
          form?.mode === "edit" ? t("recruits.editTitle") : t("recruits.addTitle")
        }
      >
        {form !== null && (
          <RecruitForm
            mode={form.mode}
            initial={form.mode === "edit" ? form.recruit : undefined}
            onDone={() => setForm(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function RecruitForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: RecruitRow;
  onDone: () => void;
}) {
  const { t, locale } = useLanguage();
  const action = mode === "create" ? createRecruit : updateRecruit;
  const [state, formAction, pending] = useActionState<
    RecruitFormState,
    FormData
  >(action, undefined);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-3">
      {mode === "edit" && <input type="hidden" name="id" value={initial!.id} />}
      <div>
        <Label htmlFor="name">{t("field.name")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name}
          required
          autoFocus
          placeholder={t("field.namePlaceholder")}
        />
      </div>
      <div>
        <Label htmlFor="language">{t("field.language")}</Label>
        <Select
          id="language"
          name="language"
          defaultValue={initial?.language ?? "de"}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {recruitLangLabel(locale, l.value)}
            </option>
          ))}
        </Select>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={pending} className="flex-1">
          {mode === "create" ? t("common.add") : t("common.save")}
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

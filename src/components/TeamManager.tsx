"use client";

import { useActionState } from "react";
import { inviteTeamMember, type InviteState } from "@/lib/actions/team";
import { Badge, Button, Card, Input, Label, Spinner } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

export function TeamManager({ members }: { members: Member[] }) {
  const t = useT();
  const [state, action, pending] = useActionState<InviteState, FormData>(
    inviteTeamMember,
    undefined,
  );

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <h2 className="mb-3 font-medium text-slate-900">{t("team.invite")}</h2>
        <form action={action} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="email">{t("field.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@beispiel.ch"
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Spinner /> {t("team.sending")}
                </>
              ) : (
                t("team.send")
              )}
            </Button>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.message && (
            <p className="text-sm text-emerald-600">{state.message}</p>
          )}
        </form>
        <p className="mt-3 text-xs text-slate-400">{t("team.inviteHint")}</p>
      </Card>

      <div>
        <h2 className="mb-2 font-medium text-slate-900">{t("team.members")}</h2>
        {members.length === 0 ? (
          <p className="text-sm text-slate-400">{t("team.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id}>
                <Card className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {m.full_name || "—"}
                    </p>
                    <p className="truncate text-sm text-slate-500">{m.email}</p>
                  </div>
                  <Badge
                    className={
                      m.role === "admin"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500"
                    }
                  >
                    {m.role === "admin" ? t("role.admin") : t("role.evaluator")}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

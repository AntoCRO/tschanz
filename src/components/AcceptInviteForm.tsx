"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/lib/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

export function AcceptInviteForm({ defaultName }: { defaultName?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(acceptInvite, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="full_name">{t("field.name")}</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={defaultName}
          required
          placeholder={t("field.namePlaceholder")}
        />
      </div>
      <div>
        <Label htmlFor="password">{t("field.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder={t("invite.passwordHint")}
        />
      </div>
      <div>
        <Label htmlFor="confirm">{t("field.passwordConfirm")}</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner /> {t("invite.submitting")}
          </>
        ) : (
          t("invite.submit")
        )}
      </Button>
    </form>
  );
}

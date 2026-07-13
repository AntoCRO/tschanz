"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  resetPassword,
  type AuthActionState,
  type ResetRequestState,
} from "@/lib/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordReset,
    undefined,
  );

  if (state?.ok) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        {t("forgot.sent")}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("field.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="name@beispiel.ch"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner /> {t("forgot.submitting")}
          </>
        ) : (
          t("forgot.submit")
        )}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    resetPassword,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="password">{t("field.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          autoFocus
          minLength={8}
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
          minLength={8}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner /> {t("reset.submitting")}
          </>
        ) : (
          t("reset.submit")
        )}
      </Button>
    </form>
  );
}

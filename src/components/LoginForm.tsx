"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

export function LoginForm() {
  const t = useT();
  const [state, action, pending] = useActionState(login, undefined);

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
          placeholder="name@beispiel.ch"
        />
      </div>
      <div>
        <Label htmlFor="password">{t("field.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Spinner /> {t("login.submitting")}
          </>
        ) : (
          t("login.submit")
        )}
      </Button>
      <p className="text-center text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-slate-500 hover:underline"
        >
          {t("login.forgot")}
        </Link>
      </p>
    </form>
  );
}

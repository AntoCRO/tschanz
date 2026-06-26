"use client";

import { logout } from "@/lib/actions/auth";
import { NavTabs } from "@/components/NavTabs";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

export function Header({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const t = useT();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
        <span className="font-semibold text-slate-900">{t("app.name")}</span>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <span className="hidden text-sm text-slate-500 sm:inline">
            {name}
            {isAdmin ? ` · ${t("header.admin")}` : ""}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              {t("header.logout")}
            </Button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-2">
        <NavTabs />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export function NavTabs() {
  const pathname = usePathname();
  const t = useT();

  // Every signed-in user has full access.
  const items = [
    { href: "/events", label: t("nav.events") },
    { href: "/admin/recruits", label: t("nav.recruits") },
    { href: "/admin/team", label: t("nav.team") },
    { href: "/sidequests", label: t("nav.sidequest") },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map((it) => {
        const active =
          pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export function NavTabs({ openOrders = 0 }: { openOrders?: number }) {
  const pathname = usePathname();
  const t = useT();

  // Every signed-in user has full access.
  const items = [
    { href: "/events", label: t("nav.events") },
    { href: "/admin/recruits", label: t("nav.recruits") },
    { href: "/admin/team", label: t("nav.team") },
    { href: "/sidequests", label: t("nav.sidequest") },
    { href: "/bestellungen", label: t("nav.orders"), badge: openOrders },
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
            {(it.badge ?? 0) > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                {it.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

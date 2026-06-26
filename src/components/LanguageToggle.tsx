"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Flag } from "@/components/Flag";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            title={l.toUpperCase()}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100",
            )}
          >
            <Flag lang={l} className="h-3 w-[18px]" />
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

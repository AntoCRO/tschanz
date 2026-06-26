"use client";

import { RATING_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TONE_ACTIVE: Record<string, string> = {
  veryneg: "bg-red-600 text-white border-red-600",
  neg: "bg-orange-500 text-white border-orange-500",
  neutral: "bg-slate-500 text-white border-slate-500",
  pos: "bg-lime-600 text-white border-lime-600",
  verypos: "bg-emerald-600 text-white border-emerald-600",
};

export function RatingSelector({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Bewertung">
      {RATING_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "h-11 rounded-lg border text-sm font-bold transition-colors",
              active
                ? TONE_ACTIVE[opt.tone]
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

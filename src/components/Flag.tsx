import { cn } from "@/lib/utils";

/**
 * Small SVG flag for a language ('de' | 'fr'). Uses real SVG (not emoji)
 * because flag emojis don't render on Windows.
 */
export function Flag({ lang, className }: { lang: string; className?: string }) {
  const cls = cn(
    "inline-block shrink-0 rounded-[2px] border border-slate-300 overflow-hidden",
    className ?? "h-3.5 w-5",
  );

  if (lang === "fr") {
    return (
      <svg
        viewBox="0 0 30 20"
        className={cls}
        role="img"
        aria-label="Français"
        preserveAspectRatio="none"
      >
        <rect width="10" height="20" x="0" fill="#0055A4" />
        <rect width="10" height="20" x="10" fill="#FFFFFF" />
        <rect width="10" height="20" x="20" fill="#EF4135" />
      </svg>
    );
  }

  // German flag (default for 'de')
  return (
    <svg
      viewBox="0 0 30 20"
      className={cls}
      role="img"
      aria-label="Deutsch"
      preserveAspectRatio="none"
    >
      <rect width="30" height="6.67" y="0" fill="#000000" />
      <rect width="30" height="6.67" y="6.67" fill="#DD0000" />
      <rect width="30" height="6.66" y="13.34" fill="#FFCE00" />
    </svg>
  );
}

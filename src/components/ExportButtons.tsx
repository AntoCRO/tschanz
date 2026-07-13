"use client";

import { Button } from "@/components/ui";
import { useT } from "@/components/LanguageProvider";

export type CsvRow = (string | number | null | undefined)[];

function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * CSV download (semicolon separator + BOM so German-locale Excel opens it
 * correctly) and a print button for the browser's PDF export.
 */
export function ExportButtons({
  filename,
  rows,
}: {
  filename: string;
  rows: CsvRow[];
}) {
  const t = useT();

  const downloadCsv = () => {
    const csv =
      "\uFEFF" + rows.map((r) => r.map(csvEscape).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex shrink-0 gap-2 print:hidden">
      <Button size="sm" variant="secondary" onClick={downloadCsv}>
        {t("export.csv")}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => window.print()}>
        {t("export.print")}
      </Button>
    </div>
  );
}

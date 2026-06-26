import { clsx, type ClassValue } from "clsx";

/** Conditional className helper. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format a YYYY-MM-DD date + HH:MM[:SS] time for display (de-CH style). */
export function formatEventDateTime(date: string, time: string): string {
  const [y, m, d] = date.split("-");
  const hhmm = time.slice(0, 5);
  return `${d}.${m}.${y}, ${hhmm}`;
}

export function formatEventDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Given an ISO week string like "2026-W26", returns the Monday..Sunday date
 * range as YYYY-MM-DD strings. ISO 8601: week 1 is the week containing Jan 4.
 */
export function isoWeekRange(
  weekStr: string,
): { start: string; end: string } | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekStr);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1));
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: fmtDate(monday), end: fmtDate(sunday) };
}

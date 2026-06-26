/** Rating scale: stored as smallint 1..5 (grades), displayed as -- / - / 0 / + / ++ */
export const RATING_OPTIONS = [
  { value: 1, label: "--", tone: "veryneg" },
  { value: 2, label: "-", tone: "neg" },
  { value: 3, label: "0", tone: "neutral" },
  { value: 4, label: "+", tone: "pos" },
  { value: 5, label: "++", tone: "verypos" },
] as const;

export type RatingValue = (typeof RATING_OPTIONS)[number]["value"];

export function ratingLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "–";
  return RATING_OPTIONS.find((o) => o.value === score)?.label ?? String(score);
}

export const LANGUAGES = [
  { value: "de", label: "Deutsch", short: "DE" },
  { value: "fr", label: "Französisch", short: "FR" },
] as const;

export type LanguageValue = (typeof LANGUAGES)[number]["value"];

export function languageLabel(lang: string): string {
  return LANGUAGES.find((l) => l.value === lang)?.label ?? lang;
}

export function languageShort(lang: string): string {
  return LANGUAGES.find((l) => l.value === lang)?.short ?? lang.toUpperCase();
}

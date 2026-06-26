import { cookies } from "next/headers";
import {
  type Locale,
  type TranslationKey,
  t as translate,
  DEFAULT_LOCALE,
  LOCALES,
} from "@/lib/i18n";

/** Reads the current UI locale from the `lang` cookie (server-side). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("lang")?.value;
  return (LOCALES as string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
}

/** Returns a translator bound to the current request's locale. */
export async function getServerT() {
  const locale = await getLocale();
  return (key: TranslationKey, params?: Record<string, string | number>) =>
    translate(locale, key, params);
}

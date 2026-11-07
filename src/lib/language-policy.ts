import type { Locale } from "./engine";

// Arabic resources and RTL presentation are retained for a future release.
export const ENABLE_ARABIC: boolean = false;
export const enabledLocales: Locale[] = ENABLE_ARABIC ? ["en", "ar"] : ["en"];
export type LocalizedText = { en: string; ar?: string };

export function resolveLocale(preference: unknown): Locale {
  return ENABLE_ARABIC && preference === "ar" ? "ar" : "en";
}

export function localizedText(value: LocalizedText | undefined, locale: Locale): string {
  return value?.[resolveLocale(locale)] || value?.en || "";
}

export function hasRequiredTranslations(value: unknown, arabicEnabled = ENABLE_ARABIC): boolean {
  if (!value || typeof value !== "object") return false;
  const text = value as Partial<Record<Locale, unknown>>;
  return typeof text.en === "string" && !!text.en.trim() &&
    (!arabicEnabled || typeof text.ar === "string" && !!text.ar.trim());
}

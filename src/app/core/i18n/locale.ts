export const LOCALES = ['en', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

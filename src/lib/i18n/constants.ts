import type { Locale } from './dictionary';

export const LOCALE_COOKIE = 'locale';

export function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'es';
}

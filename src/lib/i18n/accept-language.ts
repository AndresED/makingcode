import type { Locale } from './dictionary';

/** Primary language from Accept-Language (e.g. `es-PE,en;q=0.8` → `es`). */
export function localeFromAcceptLanguage(header: string): Locale | null {
  const primary = header.split(',')[0]?.trim().split(';')[0]?.trim().toLowerCase() ?? '';
  if (primary.startsWith('es')) return 'es';
  if (primary.startsWith('en')) return 'en';
  return null;
}

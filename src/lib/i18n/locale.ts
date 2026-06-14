import { cookies, headers } from 'next/headers';
import { localeFromAcceptLanguage } from './accept-language';
import { isLocale, LOCALE_COOKIE } from './constants';
import type { Locale } from './dictionary';

export { LOCALE_COOKIE } from './constants';

/** UI locale: cookie → Accept-Language → `en`. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;

  const headersList = await headers();
  const fromAccept = localeFromAcceptLanguage(headersList.get('accept-language') ?? '');
  return fromAccept ?? 'en';
}

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE } from './constants';
import type { Locale } from './dictionary';

export { LOCALE_COOKIE } from './constants';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : 'en';
}

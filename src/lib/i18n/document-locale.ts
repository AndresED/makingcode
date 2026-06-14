import { headers } from 'next/headers';
import type { Locale } from './dictionary';
import { getLocale } from './locale';
import { getPostLocaleBySlug } from './post-locale';

const BLOG_POST_PATH = /^\/blog\/([^/]+)$/;

/** Document `<html lang>`: post slug wins over UI locale. */
export async function getDocumentLocale(): Promise<Locale> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const blogMatch = pathname.match(BLOG_POST_PATH);

  if (blogMatch) {
    const postLocale = await getPostLocaleBySlug(blogMatch[1]);
    if (postLocale) return postLocale;
  }

  return getLocale();
}

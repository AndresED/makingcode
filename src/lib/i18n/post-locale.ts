import { cache } from 'react';
import type { Locale } from './dictionary';
import { getPublishedPostRecordBySlug } from '@/lib/posts/repository';
import { localeFromPostSlug } from '@/lib/seo/locale-from-slug';

export const getPostLocaleBySlug = cache(async (slug: string): Promise<Locale | null> => {
  const record = await getPublishedPostRecordBySlug(slug);
  if (!record) return null;
  return localeFromPostSlug(record, slug);
});

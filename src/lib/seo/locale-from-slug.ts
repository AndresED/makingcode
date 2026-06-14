import type { Locale } from '@/lib/i18n/dictionary';
import type { PostRecord } from '@/lib/posts/types';

/** Resolve content locale from URL slug — stable for crawlers (not cookie). */
export function localeFromPostSlug(post: PostRecord, slug: string): Locale {
  if (slug === post.slug_es && slug !== post.slug_en) return 'es';
  return 'en';
}

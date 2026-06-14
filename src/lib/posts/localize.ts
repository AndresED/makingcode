import type { Locale } from '@/lib/i18n/dictionary';
import { estimateReadingTimeMinutes } from './utils';
import type { LocalizedPost, PostRecord } from './types';

export function localizePost(post: PostRecord, locale: Locale): LocalizedPost {
  const isEs = locale === 'es';

  const title = isEs ? post.title_es : post.title_en;
  const slug = isEs ? post.slug_es : post.slug_en;
  const alternateSlug = isEs ? post.slug_en : post.slug_es;
  const excerpt = isEs ? post.excerpt_es : post.excerpt_en;
  const body_md = isEs ? post.body_md_es : post.body_md_en;
  const body_html = isEs ? post.body_html_es : post.body_html_en;

  return {
    id: post.id,
    slug,
    alternateSlug,
    title,
    excerpt,
    body_md,
    body_html,
    category: post.category,
    cover_image_url: post.cover_image_url,
    series_slug: post.series?.series_slug ?? null,
    series_order: post.series?.position ?? null,
    reading_time_minutes: estimateReadingTimeMinutes(body_md),
    published_at: post.published_at ?? '',
    status: post.status,
    author_id: post.author_id,
    created_at: post.created_at,
    updated_at: post.updated_at,
    title_en: post.title_en,
    title_es: post.title_es,
    slug_en: post.slug_en,
    slug_es: post.slug_es,
  };
}

export function slugForLocale(post: PostRecord, locale: Locale): string {
  return locale === 'es' ? post.slug_es : post.slug_en;
}

import type { Locale } from '@/lib/i18n/dictionary';
import { localizePost } from './localize';
import { listPublishedPostRecords } from './repository';
import type { PostSummary } from './types';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export async function searchPublishedPosts(
  query: string,
  locale: Locale,
  limit = 12,
): Promise<PostSummary[]> {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const records = await listPublishedPostRecords();

  return records
    .map((record) => localizePost(record, locale))
    .filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.body_md}`.toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, limit)
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      alternateSlug: post.alternateSlug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      cover_image_url: post.cover_image_url,
      reading_time_minutes: post.reading_time_minutes,
      published_at: post.published_at,
      series_order: post.series_order,
    }));
}

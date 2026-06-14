import { createAnonClient } from '@/lib/supabase/anon';
import type { Locale } from '@/lib/i18n/dictionary';
import { localizePost } from './localize';
import type { PostRecord, PostSummary } from './types';

const searchColumns =
  'id, title_en, title_es, slug_en, slug_es, excerpt_en, excerpt_es, category, cover_image_url, reading_time_minutes, published_at, status';

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

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(searchColumns)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PostRecord[])
    .map((record) => localizePost(record, locale))
    .filter((post) => {
      const haystack = `${post.title} ${post.excerpt}`.toLowerCase();
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
      series_order: null,
    }));
}

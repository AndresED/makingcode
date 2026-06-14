import { createAnonClient } from '@/lib/supabase/anon';
import type { Locale } from '@/lib/i18n/dictionary';
import { localizePost } from './localize';
import type { PostRecord, PostSummary } from './types';

const searchColumns =
  'id, title_en, title_es, slug_en, slug_es, excerpt_en, excerpt_es, category, cover_image_url, reading_time_minutes, published_at, status';

export interface SeriesSearchHit {
  slug: string;
  title: string;
  excerpt: string;
}

export interface ContentSearchResults {
  posts: PostSummary[];
  series: SeriesSearchHit[];
}

interface SearchRpcRow {
  result_type: string;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  rank: number;
}

function normalizeQuery(query: string): string {
  return query.trim();
}

function isFtsUnavailable(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('search_published_content') ||
    lower.includes('search_vector') ||
    lower.includes('does not exist')
  );
}

async function searchPublishedPostsInMemory(
  query: string,
  locale: Locale,
  limit: number,
): Promise<ContentSearchResults> {
  const q = normalizeQuery(query).toLowerCase();
  if (q.length < 2) return { posts: [], series: [] };

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(searchColumns)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const posts = ((data ?? []) as PostRecord[])
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

  return { posts, series: [] };
}

export async function searchPublishedContent(
  query: string,
  locale: Locale,
  limit = 12,
): Promise<ContentSearchResults> {
  const q = normalizeQuery(query);
  if (q.length < 2) return { posts: [], series: [] };

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc('search_published_content', {
    search_query: q,
    search_locale: locale,
    result_limit: limit,
  });

  if (error) {
    if (isFtsUnavailable(error.message)) {
      return searchPublishedPostsInMemory(q, locale, limit);
    }
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SearchRpcRow[];
  const posts: PostSummary[] = [];
  const series: SeriesSearchHit[] = [];

  for (const row of rows) {
    if (row.result_type === 'series') {
      series.push({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
      });
      continue;
    }

    posts.push({
      id: row.id,
      slug: row.slug,
      alternateSlug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      category: row.category as PostSummary['category'],
      cover_image_url: row.cover_image_url,
      reading_time_minutes: row.reading_time_minutes ?? 1,
      published_at: row.published_at ?? new Date().toISOString(),
      series_order: null,
    });
  }

  return { posts, series };
}

/** @deprecated Use searchPublishedContent */
export async function searchPublishedPosts(
  query: string,
  locale: Locale,
  limit = 12,
): Promise<PostSummary[]> {
  const { posts } = await searchPublishedContent(query, locale, limit);
  return posts;
}

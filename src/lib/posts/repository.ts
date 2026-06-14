import { cache } from 'react';
import { createAnonClient } from '@/lib/supabase/anon';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import type { PostCategory } from './categories';
import { POSTS_PER_PAGE } from './constants';
import { localizePost } from './localize';
import {
  enrichPostsWithSeries,
  getPublishedSeriesWithPosts,
  listPublishedSeriesSlugs,
} from './series-repository';
import type {
  LocalizedPost,
  PostDetail,
  PostRecord,
  PostSummary,
  SeriesPostSummary,
} from './types';

function formatSupabaseError(error: { message: string; cause?: unknown }): Error {
  const cause =
    error.cause instanceof Error
      ? error.cause.message
      : error.cause
        ? String(error.cause)
        : '';
  return new Error(cause ? `${error.message}: ${cause}` : error.message);
}

const recordColumns =
  'id, title_en, title_es, slug_en, slug_es, excerpt_en, excerpt_es, body_md_en, body_md_es, body_html_en, body_html_es, category, cover_image_url, reading_time_minutes, published_at, status, author_id, created_at, updated_at';

const summaryColumns =
  'id, title_en, title_es, slug_en, slug_es, excerpt_en, excerpt_es, category, cover_image_url, reading_time_minutes, published_at, status';

export interface PaginatedPosts {
  posts: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function toSummary(post: LocalizedPost): PostSummary {
  return {
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
  };
}

export const listPublishedPosts = cache(async (options?: {
  page?: number;
  pageSize?: number;
  category?: PostCategory;
  locale?: Locale;
}): Promise<PaginatedPosts> => {
  const locale = options?.locale ?? (await getLocale());
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? POSTS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createAnonClient();
  let query = supabase
    .from('posts')
    .select(summaryColumns, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { data, error, count } = await query;

  if (error) {
    throw formatSupabaseError(error);
  }

  const total = count ?? 0;
  const posts = ((data ?? []) as PostRecord[]).map((row) =>
    toSummary(localizePost(row, locale)),
  );

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
});

export async function getPublishedPostBySlug(
  slug: string,
  locale?: Locale,
): Promise<PostDetail | null> {
  const resolvedLocale = locale ?? (await getLocale());
  const record = await getPublishedPostRecordBySlug(slug);
  if (!record) return null;
  return localizePost(record, resolvedLocale);
}

export const getPublishedPostRecordBySlug = cache(async (slug: string): Promise<PostRecord | null> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumns)
    .eq('status', 'published')
    .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error);
  }

  if (!data) return null;

  const [enriched] = await enrichPostsWithSeries([data as PostRecord], { publishedOnly: true });
  return enriched ?? null;
});

export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('status', 'published');

  if (error) {
    throw formatSupabaseError(error);
  }

  const slugs: string[] = [];
  for (const row of data ?? []) {
    slugs.push(row.slug_en, row.slug_es);
  }
  return slugs;
}

export async function listPublishedPostRecords(): Promise<PostRecord[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumns)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw formatSupabaseError(error);
  }

  return enrichPostsWithSeries((data ?? []) as PostRecord[], { publishedOnly: true });
}

export async function listAllPostsForAdmin(): Promise<PostRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumns)
    .order('updated_at', { ascending: false });

  if (error) {
    throw formatSupabaseError(error);
  }

  return enrichPostsWithSeries((data ?? []) as PostRecord[]);
}

export async function listRelatedPosts(
  postId: string,
  category: PostCategory,
  locale?: Locale,
  options?: { seriesSlug?: string | null; limit?: number },
): Promise<PostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const limit = options?.limit ?? 3;
  const related: PostSummary[] = [];
  const seen = new Set<string>([postId]);

  if (options?.seriesSlug) {
    const inSeries = await listPublishedPostsInSeries(options.seriesSlug, resolvedLocale);
    for (const post of inSeries) {
      if (related.length >= limit) break;
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      related.push(post);
    }
  }

  if (related.length < limit) {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('posts')
      .select(summaryColumns)
      .eq('status', 'published')
      .eq('category', category)
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit * 2);

    if (error) {
      throw formatSupabaseError(error);
    }

    for (const row of (data ?? []) as PostRecord[]) {
      if (related.length >= limit) break;
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      related.push(toSummary(localizePost(row, resolvedLocale)));
    }
  }

  return related;
}

export interface PublishedSeriesSummary {
  slug: string;
  postCount: number;
}

export const listPublishedSeries = cache(async (): Promise<PublishedSeriesSummary[]> => {
  const rows = await listPublishedSeriesSlugs();
  return rows.map(({ slug, postCount }) => ({ slug, postCount }));
});

export async function listPublishedPostsInSeries(
  seriesSlug: string,
  locale?: Locale,
): Promise<PostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const bundle = await getPublishedSeriesWithPosts(seriesSlug);
  if (!bundle) return [];
  return bundle.posts.map((row) => toSummary(localizePost(row, resolvedLocale)));
}

export async function listSeriesPosts(
  seriesSlug: string,
  locale?: Locale,
): Promise<SeriesPostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const bundle = await getPublishedSeriesWithPosts(seriesSlug);
  if (!bundle) return [];
  return bundle.posts.map((row) => {
    const post = localizePost(row, resolvedLocale);
    return { id: post.id, slug: post.slug, title: post.title };
  });
}

export async function getPostByIdForAdmin(id: string): Promise<PostRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumns)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error);
  }

  if (!data) return null;

  const [enriched] = await enrichPostsWithSeries([data as PostRecord]);
  return enriched ?? null;
}

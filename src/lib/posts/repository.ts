import { createAnonClient } from '@/lib/supabase/anon';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import type { PostCategory } from './categories';
import { POSTS_PER_PAGE } from './constants';
import { localizePost } from './localize';
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

const recordColumnsWithSeries = `${recordColumns}, series_slug, series_order`;

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
  };
}

export async function listPublishedPosts(options?: {
  page?: number;
  pageSize?: number;
  category?: PostCategory;
  locale?: Locale;
}): Promise<PaginatedPosts> {
  const locale = options?.locale ?? (await getLocale());
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? POSTS_PER_PAGE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createAnonClient();
  let query = supabase
    .from('posts')
    .select(recordColumns, { count: 'exact' })
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
}

export async function getPublishedPostBySlug(
  slug: string,
  locale?: Locale,
): Promise<PostDetail | null> {
  const resolvedLocale = locale ?? (await getLocale());
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .eq('status', 'published')
    .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
    .maybeSingle();

  if (error) {
    if (error.message.includes('series_slug') || error.message.includes('series_order')) {
      const fallback = await supabase
        .from('posts')
        .select(recordColumns)
        .eq('status', 'published')
        .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
        .maybeSingle();
      if (fallback.error) throw formatSupabaseError(fallback.error);
      if (!fallback.data) return null;
      return localizePost(fallback.data as PostRecord, resolvedLocale);
    }
    throw formatSupabaseError(error);
  }

  if (!data) return null;

  return localizePost(data as PostRecord, resolvedLocale);
}

export async function getPublishedPostRecordBySlug(slug: string): Promise<PostRecord | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .eq('status', 'published')
    .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
    .maybeSingle();

  if (error) {
    if (error.message.includes('series_slug') || error.message.includes('series_order')) {
      const fallback = await supabase
        .from('posts')
        .select(recordColumns)
        .eq('status', 'published')
        .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
        .maybeSingle();
      if (fallback.error) throw formatSupabaseError(fallback.error);
      return (fallback.data as PostRecord | null) ?? null;
    }
    throw formatSupabaseError(error);
  }

  return (data as PostRecord | null) ?? null;
}

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
    .select(recordColumnsWithSeries)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    if (error.message.includes('series_slug') || error.message.includes('series_order')) {
      const fallback = await supabase
        .from('posts')
        .select(recordColumns)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (fallback.error) throw formatSupabaseError(fallback.error);
      return (fallback.data ?? []) as PostRecord[];
    }
    throw formatSupabaseError(error);
  }

  return (data ?? []) as PostRecord[];
}

export async function listAllPostsForAdmin(): Promise<PostRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.message.includes('series_slug') || error.message.includes('series_order')) {
      const fallback = await supabase
        .from('posts')
        .select(recordColumns)
        .order('updated_at', { ascending: false });
      if (fallback.error) throw formatSupabaseError(fallback.error);
      return (fallback.data ?? []) as PostRecord[];
    }
    throw formatSupabaseError(error);
  }

  return (data ?? []) as PostRecord[];
}

export async function listRelatedPosts(
  postId: string,
  category: PostCategory,
  locale?: Locale,
  limit = 3,
): Promise<PostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumns)
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw formatSupabaseError(error);
  }

  return ((data ?? []) as PostRecord[]).map((row) =>
    toSummary(localizePost(row, resolvedLocale)),
  );
}

export interface PublishedSeriesSummary {
  slug: string;
  postCount: number;
}

export async function listPublishedSeries(): Promise<PublishedSeriesSummary[]> {
  const records = await listPublishedPostRecords();
  const counts = new Map<string, number>();

  for (const post of records) {
    const slug = post.series_slug?.trim();
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([slug, postCount]) => ({ slug, postCount }))
    .sort((a, b) => b.postCount - a.postCount);
}

export async function listPublishedPostsInSeries(
  seriesSlug: string,
  locale?: Locale,
): Promise<PostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .eq('status', 'published')
    .eq('series_slug', seriesSlug)
    .order('series_order', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: true });

  if (error) {
    if (error.message.includes('series_slug')) return [];
    throw formatSupabaseError(error);
  }

  return ((data ?? []) as PostRecord[]).map((row) =>
    toSummary(localizePost(row, resolvedLocale)),
  );
}

export async function listSeriesPosts(
  seriesSlug: string,
  locale?: Locale,
): Promise<SeriesPostSummary[]> {
  const resolvedLocale = locale ?? (await getLocale());
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .eq('status', 'published')
    .eq('series_slug', seriesSlug)
    .order('series_order', { ascending: true, nullsFirst: false })
    .order('published_at', { ascending: true });

  if (error) {
    if (error.message.includes('series_slug')) return [];
    throw formatSupabaseError(error);
  }

  return ((data ?? []) as PostRecord[]).map((row) => {
    const post = localizePost(row, resolvedLocale);
    return { id: post.id, slug: post.slug, title: post.title };
  });
}

export async function getPostByIdForAdmin(id: string): Promise<PostRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(recordColumnsWithSeries)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (error.message.includes('series_slug') || error.message.includes('series_order')) {
      const fallback = await supabase
        .from('posts')
        .select(recordColumns)
        .eq('id', id)
        .maybeSingle();
      if (fallback.error) throw formatSupabaseError(fallback.error);
      return (fallback.data as PostRecord | null) ?? null;
    }
    throw formatSupabaseError(error);
  }

  return (data as PostRecord | null) ?? null;
}

import { createAnonClient } from '@/lib/supabase/anon';
import { createClient } from '@/lib/supabase/server';
import type { PostCategory } from './categories';
import { POSTS_PER_PAGE } from './constants';
import type { PostSummary, PostDetail } from './types';

function formatSupabaseError(error: { message: string; cause?: unknown }): Error {
  const cause =
    error.cause instanceof Error
      ? error.cause.message
      : error.cause
        ? String(error.cause)
        : '';
  return new Error(cause ? `${error.message}: ${cause}` : error.message);
}

const summaryColumns =
  'id, slug, title, excerpt, category, cover_image_url, reading_time_minutes, published_at';

export interface PaginatedPosts {
  posts: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listPublishedPosts(options?: {
  page?: number;
  pageSize?: number;
  category?: PostCategory;
}): Promise<PaginatedPosts> {
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
  return {
    posts: (data ?? []) as unknown as PostSummary[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw formatSupabaseError(error);
  }

  return data as PostDetail | null;
}

export async function listPublishedSlugs(): Promise<string[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    throw formatSupabaseError(error);
  }

  return (data ?? []).map((row) => row.slug);
}

export async function listAllPostsForAdmin(): Promise<PostDetail[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw formatSupabaseError(error);
  }

  return (data ?? []) as PostDetail[];
}

export async function getPostByIdForAdmin(id: string): Promise<PostDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw formatSupabaseError(error);
  }

  return data as PostDetail | null;
}

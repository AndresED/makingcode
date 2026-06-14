import { createClient } from '@/lib/supabase/server';
import type { PostRecord } from './types';

const recordColumns =
  'id, title_en, title_es, slug_en, slug_es, excerpt_en, excerpt_es, body_md_en, body_md_es, body_html_en, body_html_es, category, cover_image_url, reading_time_minutes, published_at, status, author_id, created_at, updated_at';

const recordColumnsWithSeries = `${recordColumns}, series_slug, series_order`;

export interface AdminSeriesSummary {
  slug: string;
  postCount: number;
  publishedCount: number;
}

function sortBySeriesOrder(a: PostRecord, b: PostRecord): number {
  const orderA = a.series_order ?? 999;
  const orderB = b.series_order ?? 999;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export async function listAdminSeriesSummaries(): Promise<AdminSeriesSummary[]> {
  const posts = await listAllPostsForSeriesAdmin();
  const map = new Map<string, AdminSeriesSummary>();

  for (const post of posts) {
    const slug = post.series_slug?.trim();
    if (!slug) continue;

    const current = map.get(slug) ?? { slug, postCount: 0, publishedCount: 0 };
    current.postCount += 1;
    if (post.status === 'published') current.publishedCount += 1;
    map.set(slug, current);
  }

  return [...map.values()].sort((a, b) => b.postCount - a.postCount || a.slug.localeCompare(b.slug));
}

export async function listAllPostsForSeriesAdmin(): Promise<PostRecord[]> {
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
      if (fallback.error) throw new Error(fallback.error.message);
      return (fallback.data ?? []) as PostRecord[];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as PostRecord[];
}

export async function listPostsInSeriesAdmin(seriesSlug: string): Promise<PostRecord[]> {
  const posts = await listAllPostsForSeriesAdmin();
  return posts.filter((p) => p.series_slug?.trim() === seriesSlug).sort(sortBySeriesOrder);
}

export async function listPostsAvailableForSeriesAdmin(seriesSlug: string): Promise<PostRecord[]> {
  const posts = await listAllPostsForSeriesAdmin();
  return posts
    .filter((p) => p.series_slug?.trim() !== seriesSlug)
    .sort((a, b) => a.title_en.localeCompare(b.title_en));
}

export async function countPostsWithoutSeriesAdmin(): Promise<number> {
  const posts = await listAllPostsForSeriesAdmin();
  return posts.filter((p) => !p.series_slug?.trim()).length;
}

export function nextSeriesOrder(postsInSeries: PostRecord[]): number {
  const max = postsInSeries.reduce((acc, p) => Math.max(acc, p.series_order ?? 0), 0);
  return max + 1;
}

export const SERIES_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSeriesSlug(slug: string): boolean {
  return SERIES_SLUG_PATTERN.test(slug) && slug.length <= 80;
}

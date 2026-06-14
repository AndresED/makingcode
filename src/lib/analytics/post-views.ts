import { cache } from 'react';
import { createAnonClient } from '@/lib/supabase/anon';
import type { Locale } from '@/lib/i18n/dictionary';
import { listPublishedPosts } from '@/lib/posts/repository';
import type { PostRecord, PostSummary } from '@/lib/posts/types';

export interface SlugViewStats {
  pageviews: number;
  visitors: number;
}

export type PostViewStats = SlugViewStats;

function sinceDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function slugFromBlogPath(path: string): string | null {
  const match = path.match(/^\/blog\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function isAnalyticsUnavailable(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('analytics_public_top_blog_slugs') ||
    lower.includes('page_view_events') ||
    lower.includes('does not exist')
  );
}

interface SlugViewRow {
  slug: string;
  pageviews: number;
  visitors: number;
}

async function fetchBlogSlugViewCounts(
  days: number,
  limit = 100,
): Promise<Map<string, SlugViewStats>> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc('analytics_public_top_blog_slugs', {
    p_since: sinceDays(days),
    p_limit: limit,
  });

  if (error) {
    if (isAnalyticsUnavailable(error.message)) {
      return new Map();
    }
    throw new Error(error.message);
  }

  const map = new Map<string, SlugViewStats>();
  for (const row of (data ?? []) as SlugViewRow[]) {
    if (!row.slug) continue;
    const existing = map.get(row.slug);
    if (existing) {
      map.set(row.slug, {
        pageviews: existing.pageviews + Number(row.pageviews ?? 0),
        visitors: existing.visitors + Number(row.visitors ?? 0),
      });
    } else {
      map.set(row.slug, {
        pageviews: Number(row.pageviews ?? 0),
        visitors: Number(row.visitors ?? 0),
      });
    }
  }
  return map;
}

function viewsForPost(
  post: Pick<PostRecord, 'id' | 'slug_en' | 'slug_es'>,
  bySlug: Map<string, SlugViewStats>,
): PostViewStats {
  const en = bySlug.get(post.slug_en);
  const es = bySlug.get(post.slug_es);

  if (!en && !es) {
    return { pageviews: 0, visitors: 0 };
  }

  if (post.slug_en === post.slug_es) {
    return en ?? es ?? { pageviews: 0, visitors: 0 };
  }

  return {
    pageviews: (en?.pageviews ?? 0) + (es?.pageviews ?? 0),
    visitors: Math.max(en?.visitors ?? 0, es?.visitors ?? 0),
  };
}

export const getBlogSlugViewCounts = cache(async (days = 30, limit = 100): Promise<Map<string, SlugViewStats>> => {
  return fetchBlogSlugViewCounts(days, limit);
});

export async function getPostViewCountsByPostId(
  posts: PostRecord[],
  days = 30,
): Promise<Record<string, PostViewStats>> {
  const bySlug = await getBlogSlugViewCounts(days);
  const result: Record<string, PostViewStats> = {};

  for (const post of posts) {
    result[post.id] = viewsForPost(post, bySlug);
  }

  return result;
}

export const listMostViewedPublishedPosts = cache(
  async (locale: Locale, limit = 5, days = 30): Promise<PostSummary[]> => {
    const bySlug = await getBlogSlugViewCounts(days, 80);
    if (bySlug.size === 0) return [];

    const { posts } = await listPublishedPosts({ page: 1, pageSize: 100, locale });

    return posts
      .map((post) => ({
        post,
        views: viewsForPost(
          { id: post.id, slug_en: post.slug, slug_es: post.alternateSlug },
          bySlug,
        ),
      }))
      .filter((item) => item.views.pageviews > 0)
      .sort((a, b) => b.views.pageviews - a.views.pageviews)
      .slice(0, limit)
      .map((item) => item.post);
  },
);

export async function listTopPublicationsForAdmin(
  posts: PostRecord[],
  days = 30,
  limit = 10,
): Promise<
  Array<{
    post: PostRecord;
    stats: PostViewStats;
  }>
> {
  const bySlug = await getBlogSlugViewCounts(days, 100);

  return posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      post,
      stats: viewsForPost(post, bySlug),
    }))
    .filter((item) => item.stats.pageviews > 0)
    .sort((a, b) => b.stats.pageviews - a.stats.pageviews)
    .slice(0, limit);
}

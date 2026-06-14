import { slugFromBlogPath } from '@/lib/analytics/post-views';
import type { PostRecord } from '@/lib/posts/types';
import type { AnalyticsPageRow } from './types';

export function enrichTopPagesWithPostTitles(
  rows: AnalyticsPageRow[],
  posts: PostRecord[],
): AnalyticsPageRow[] {
  const bySlug = new Map<string, PostRecord>();
  for (const post of posts) {
    bySlug.set(post.slug_en, post);
    bySlug.set(post.slug_es, post);
  }

  return rows.map((row) => {
    const slug = slugFromBlogPath(row.path);
    if (!slug) return row;

    const post = bySlug.get(slug);
    if (!post) return row;

    return {
      ...row,
      label: post.title_en,
    };
  });
}

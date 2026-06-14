'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PostViewStats } from '@/lib/analytics/post-views';
import type { PostRecord } from '@/lib/posts/types';

type StatusFilter = 'all' | 'published' | 'draft';
type SortFilter = 'recent' | 'views';

interface PostListProps {
  posts: PostRecord[];
  viewCounts?: Record<string, PostViewStats>;
}

function formatViews(count: number): string {
  if (count === 0) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    count,
  );
}

export function PostList({ posts, viewCounts = {} }: PostListProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortFilter>('recent');
  const hasViews = Object.values(viewCounts).some((stats) => stats.pageviews > 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = posts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false;
      if (!q) return true;
      const haystack = `${post.title_en} ${post.title_es} ${post.slug_en} ${post.slug_es} ${post.category} ${post.series?.series_slug ?? ''}`;
      return haystack.toLowerCase().includes(q);
    });

    if (sort === 'views') {
      return [...rows].sort(
        (a, b) =>
          (viewCounts[b.id]?.pageviews ?? 0) - (viewCounts[a.id]?.pageviews ?? 0),
      );
    }

    return rows;
  }, [posts, query, status, sort, viewCounts]);

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-dark-800/40 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatus(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-150 ease-out ${
                  status === tab.id
                    ? 'bg-white/[0.08] text-ink'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {hasViews ? (
            <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-dark-800/40 p-1">
              <button
                type="button"
                onClick={() => setSort('recent')}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-150 ease-out ${
                  sort === 'recent'
                    ? 'bg-white/[0.08] text-ink'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setSort('views')}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-150 ease-out ${
                  sort === 'views'
                    ? 'bg-white/[0.08] text-ink'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Top views
              </button>
            </div>
          ) : null}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink placeholder:text-ink-muted sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-muted">No posts match.</p>
      ) : (
        <ul className="surface-card divide-y divide-white/[0.06] overflow-hidden">
          {filtered.map((post) => {
            const views = viewCounts[post.id]?.pageviews ?? 0;

            return (
              <li
                key={post.id}
                className="flex flex-col gap-2 px-4 py-4 transition-colors duration-150 ease-out hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/posts/${post.id}/edit`}
                    className="font-medium text-ink transition-colors duration-150 ease-out hover:text-accent-400"
                  >
                    {post.title_en}
                  </Link>
                  <p className="mt-1 truncate text-xs text-ink-muted">
                    {post.title_es}
                    {post.series?.series_slug ? (
                      <>
                        {' '}
                        ·{' '}
                        <Link
                          href={`/dashboard/series/${post.series.series_slug}`}
                          className="text-meta-400 hover:text-ink"
                        >
                          series: {post.series.series_slug}
                          {post.series.position ? ` #${post.series.position}` : ''}
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="font-mono text-xs text-ink-muted/80">
                    /blog/{post.slug_en} · /blog/{post.slug_es}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {post.status === 'published' && views > 0 ? (
                    <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-ink-muted">
                      {formatViews(views)} views
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-meta-400">
                    {post.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      post.status === 'published'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PostRecord } from '@/lib/posts/types';

type StatusFilter = 'all' | 'published' | 'draft';

interface PostListProps {
  posts: PostRecord[];
}

export function PostList({ posts }: PostListProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false;
      if (!q) return true;
      const haystack = `${post.title_en} ${post.title_es} ${post.slug_en} ${post.slug_es} ${post.category} ${post.series_slug ?? ''}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [posts, query, status]);

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08]">
          {filtered.map((post) => (
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
                  {post.series_slug ? ` · series: ${post.series_slug}` : ''}
                </p>
                <p className="font-mono text-xs text-ink-muted/80">
                  /blog/{post.slug_en} · /blog/{post.slug_es}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
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
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import type { SeriesSearchHit } from '@/lib/posts/search';
import type { PostSummary } from '@/lib/posts/types';

interface BlogSearchProps {
  locale: Locale;
  className?: string;
}

interface SearchResponse {
  posts: PostSummary[];
  series: SeriesSearchHit[];
}

export function BlogSearch({ locale, className = '' }: BlogSearchProps) {
  const inputId = useId();
  const listId = `${inputId}-results`;
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [series, setSeries] = useState<SeriesSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setPosts([]);
      setSeries([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = (await res.json()) as SearchResponse;
      setPosts(data.posts ?? []);
      setSeries(data.series ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void search(query);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length >= 2) {
      setOpen(false);
      router.push(`/blog?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const hasResults = posts.length > 0 || series.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit} role="search">
        <label htmlFor={inputId} className="sr-only">
          {t(locale, 'blog.search')}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t(locale, 'blog.search')}
            autoComplete="off"
            aria-controls={open && hasResults ? listId : undefined}
            className="w-full rounded-xl border border-white/[0.08] bg-dark-900/80 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/70 transition-[border-color] duration-150 ease-out focus:border-meta-500/40 focus:outline-none"
          />
        </div>
      </form>

      {open && query.trim().length >= 2 ? (
        <div
          id={listId}
          className="absolute top-[calc(100%+0.5rem)] z-50 max-h-80 w-full overflow-y-auto rounded-xl border border-white/[0.1] bg-dark-800 shadow-2xl shadow-black/40"
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-ink-muted">…</p>
          ) : !hasResults ? (
            <p className="px-4 py-3 text-sm text-ink-muted">{t(locale, 'blog.noResults')}</p>
          ) : (
            <div className="divide-y divide-white/[0.06] py-1">
              {series.length > 0 ? (
                <section aria-label={t(locale, 'blog.searchSeries')}>
                  <p className="px-4 pt-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {t(locale, 'blog.searchSeries')}
                  </p>
                  <ul>
                    {series.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/series/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.04]"
                        >
                          <span className="line-clamp-1 text-sm font-medium text-ink">{item.title}</span>
                          {item.excerpt ? (
                            <span className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{item.excerpt}</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {posts.length > 0 ? (
                <ul aria-label={t(locale, 'blog.results')}>
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.04]"
                      >
                        <span className="line-clamp-1 text-sm font-medium text-ink">{post.title}</span>
                        <span className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{post.excerpt}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

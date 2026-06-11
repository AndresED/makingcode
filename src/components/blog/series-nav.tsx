import Link from 'next/link';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { formatSeriesName } from '@/lib/posts/format-series-name';
import type { SeriesPostSummary } from '@/lib/posts/types';

interface SeriesNavProps {
  seriesSlug: string;
  posts: SeriesPostSummary[];
  currentPostId: string;
  locale: Locale;
}

export function SeriesNav({ seriesSlug, posts, currentPostId, locale }: SeriesNavProps) {
  if (posts.length < 2) return null;

  const currentIndex = posts.findIndex((p) => p.id === currentPostId);
  const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const next = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <nav
      aria-label={t(locale, 'article.series')}
      className="mb-8 rounded-2xl border border-accent-500/20 bg-accent-500/5 p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="label-caps text-accent-400">
          {t(locale, 'article.series')} · {formatSeriesName(seriesSlug)}
        </p>
        <Link
          href={`/series/${seriesSlug}`}
          className="text-xs text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        >
          {t(locale, 'article.viewSeries')} →
        </Link>
      </div>
      <ol className="mb-4 space-y-1">
        {posts.map((post, i) => {
          const active = post.id === currentPostId;
          return (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className={`flex items-baseline gap-2 rounded-lg px-2 py-1 text-sm transition-colors duration-150 ease-out ${
                  active
                    ? 'bg-accent-500/10 font-medium text-accent-400'
                    : 'text-ink-muted hover:text-ink'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                <span className="font-mono text-xs opacity-60">{i + 1}.</span>
                <span className="line-clamp-1">{post.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-3 border-t border-accent-500/15 pt-3 text-sm">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="text-ink-muted hover:text-ink">
            ← {t(locale, 'article.prevInSeries')}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="ml-auto text-ink-muted hover:text-ink"
          >
            {t(locale, 'article.nextInSeries')} →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

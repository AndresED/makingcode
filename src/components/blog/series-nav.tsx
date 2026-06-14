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

function SeriesNavList({
  posts,
  currentPostId,
}: {
  posts: SeriesPostSummary[];
  currentPostId: string;
}) {
  return (
    <ol className="space-y-1">
      {posts.map((post, i) => {
        const active = post.id === currentPostId;
        return (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className={`flex items-baseline gap-2 rounded-lg px-2 py-1 text-sm transition-colors duration-150 ease-out ${
                active
                  ? 'bg-meta-500/10 font-medium text-meta-400'
                  : 'text-ink-muted hover:text-ink'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              <span className="font-mono text-xs opacity-60">{i + 1}.</span>
              <span className="line-clamp-2 sm:line-clamp-1">{post.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function SeriesNavFooter({
  prev,
  next,
  locale,
}: {
  prev: SeriesPostSummary | null;
  next: SeriesPostSummary | null;
  locale: Locale;
}) {
  if (!prev && !next) return null;

  return (
    <div className="flex flex-wrap gap-3 border-t border-meta-500/15 pt-3 text-sm">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className="text-ink-muted hover:text-ink">
          ← {t(locale, 'article.prevInSeries')}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className="ml-auto text-ink-muted hover:text-ink">
          {t(locale, 'article.nextInSeries')} →
        </Link>
      ) : null}
    </div>
  );
}

export function SeriesNav({ seriesSlug, posts, currentPostId, locale }: SeriesNavProps) {
  if (posts.length < 2) return null;

  const currentIndex = posts.findIndex((p) => p.id === currentPostId);
  const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const next = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const seriesName = formatSeriesName(seriesSlug, locale);
  const partLabel = t(locale, 'article.seriesPart')
    .replace('{current}', String(currentIndex + 1))
    .replace('{total}', String(posts.length));

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="label-caps text-meta-400">
        {t(locale, 'article.series')} · {seriesName}
      </p>
      <Link
        href={`/series/${seriesSlug}`}
        className="text-xs text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
      >
        {t(locale, 'article.viewSeries')} →
      </Link>
    </div>
  );

  return (
    <>
      <details className="group mb-8 rounded-2xl border border-meta-500/20 bg-meta-500/5 p-4 lg:hidden">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink">
              {seriesName} · {partLabel}
            </p>
            <span className="text-xs text-ink-muted group-open:hidden">{t(locale, 'article.seriesExpand')}</span>
          </div>
        </summary>
        <div className="mt-4 space-y-4">
          {header}
          <SeriesNavList posts={posts} currentPostId={currentPostId} />
          <SeriesNavFooter prev={prev} next={next} locale={locale} />
        </div>
      </details>

      <nav
        aria-label={t(locale, 'article.series')}
        className="mb-8 hidden rounded-2xl border border-meta-500/20 bg-meta-500/5 p-5 lg:block"
      >
        {header}
        <div className="mb-4 mt-3">
          <SeriesNavList posts={posts} currentPostId={currentPostId} />
        </div>
        <SeriesNavFooter prev={prev} next={next} locale={locale} />
      </nav>
    </>
  );
}

import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import type { PostSummary } from '@/lib/posts/types';

interface HomeSeriesBlockProps {
  locale: Locale;
  seriesSlug: string;
  posts: PostSummary[];
}

export function HomeSeriesBlock({ locale, seriesSlug, posts }: HomeSeriesBlockProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-5 rounded-2xl border border-white/[0.08] bg-dark-800/30 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="label-caps text-accent-400">{t(locale, 'home.seriesEyebrow')}</p>
        <h2 className="font-display text-2xl font-medium text-ink">
          {formatSeriesName(seriesSlug, locale)}
        </h2>
        <p className="text-sm text-ink-muted">{seriesArticleCountLabel(locale, posts.length)}</p>
      </div>

      <ol className="space-y-3">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-start gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors duration-150 ease-out hover:border-white/[0.08] hover:bg-white/[0.02]"
            >
              <span className="mt-0.5 font-mono text-xs text-accent-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-ink-body transition-colors duration-150 ease-out group-hover:text-ink">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href={`/series/${seriesSlug}`}
        className="inline-flex items-center gap-2 text-sm text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
      >
        {t(locale, 'home.seriesCta')} →
      </Link>
    </section>
  );
}

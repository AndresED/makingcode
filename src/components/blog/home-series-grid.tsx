import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import type { PublishedSeriesHomeItem } from '@/lib/posts/series-repository';

interface HomeSeriesGridProps {
  locale: Locale;
  items: PublishedSeriesHomeItem[];
  showViewAllLink?: boolean;
}

function localizeLatestPost(
  locale: Locale,
  item: PublishedSeriesHomeItem,
): { slug: string; title: string } | null {
  const post = item.latestPost;
  if (!post) return null;

  return {
    slug: locale === 'es' ? post.slug_es : post.slug_en,
    title: locale === 'es' ? post.title_es : post.title_en,
  };
}

function statusBadgeClass(status: PublishedSeriesHomeItem['activityStatus']): string {
  return status === 'active'
    ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
    : 'border-white/[0.08] bg-white/[0.04] text-ink-muted';
}

export function HomeSeriesGrid({ locale, items, showViewAllLink = false }: HomeSeriesGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="label-caps text-meta-400">{t(locale, 'article.series')}</p>
          <h2 className="font-display text-xl text-ink">{t(locale, 'home.seriesSectionTitle')}</h2>
        </div>
        {showViewAllLink ? (
          <Link
            href="/series"
            className="text-sm text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
          >
            {t(locale, 'series.viewAll')} →
          </Link>
        ) : null}
      </div>

      <ul
        className={`grid gap-4 ${items.length === 1 ? 'max-w-xl' : 'sm:grid-cols-2'}`}
      >
        {items.map((item) => {
          const titles = { title_en: item.title_en, title_es: item.title_es };
          const latest = localizeLatestPost(locale, item);
          const statusLabel =
            item.activityStatus === 'active'
              ? t(locale, 'home.seriesActive')
              : t(locale, 'home.seriesComplete');

          return (
            <li key={item.slug}>
              <article className="surface-card surface-card-hover group flex h-full flex-col gap-3 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(item.activityStatus)}`}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {seriesArticleCountLabel(locale, item.postCount)}
                  </span>
                </div>

                <h3 className="font-display text-lg text-ink transition-colors duration-150 ease-out group-hover:text-accent-400">
                  <Link href={`/series/${item.slug}`}>
                    {formatSeriesName(item.slug, locale, titles)}
                  </Link>
                </h3>

                {latest ? (
                  <p className="text-sm leading-relaxed text-ink-body">
                    <span className="text-ink-muted">{t(locale, 'home.seriesLatest')}: </span>
                    <Link
                      href={`/blog/${latest.slug}`}
                      className="text-ink transition-colors duration-150 ease-out hover:text-accent-400"
                    >
                      {latest.title}
                    </Link>
                  </p>
                ) : null}

                <Link
                  href={`/series/${item.slug}`}
                  className="mt-auto text-sm text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
                >
                  {t(locale, 'home.seriesCta')} →
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ListLayout } from '@/components/layout/list-layout';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import { listPublishedPosts } from '@/lib/posts/repository';
import { listPublishedSeriesCatalog } from '@/lib/posts/series-repository';
import { buildSeriesIndexMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildSeriesIndexMetadata(locale);
}

function seriesDescription(
  locale: 'en' | 'es',
  item: {
    description_en: string | null;
    description_es: string | null;
    slug: string;
    title_en: string;
    title_es: string;
  },
): string {
  const fromDb = locale === 'es' ? item.description_es : item.description_en;
  if (fromDb?.trim()) return fromDb.trim();

  const fallback =
    locale === 'es'
      ? `Artículos ordenados sobre ${formatSeriesName(item.slug, locale, item)}.`
      : `Ordered articles on ${formatSeriesName(item.slug, locale, item)}.`;
  return fallback;
}

export default async function SeriesIndexPage() {
  const locale = await getLocale();
  const [series, recentResult] = await Promise.all([
    listPublishedSeriesCatalog(),
    listPublishedPosts({ page: 1, pageSize: 5 }),
  ]);

  return (
    <ListLayout
      locale={locale}
      recentPosts={recentResult.posts}
      showRecent={recentResult.total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
      activeSeriesSlug={undefined}
    >
      <section className="space-y-8">
        <header className="space-y-4">
          <p className="label-caps text-accent-400">{t(locale, 'article.series')}</p>
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {t(locale, 'series.indexTitle')}
          </h1>
          <p className="max-w-2xl text-ink-muted">{t(locale, 'series.indexSubtitle')}</p>
        </header>

        {series.length === 0 ? (
          <div className="surface-card px-6 py-10 text-center">
            <p className="text-ink-muted">{t(locale, 'series.indexEmpty')}</p>
            <Link
              href="/blog"
              className="mt-4 inline-flex text-sm text-meta-400 transition-colors hover:text-ink"
            >
              {t(locale, 'home.ctaBlog')} →
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {series.map((item) => {
              const titles = { title_en: item.title_en, title_es: item.title_es };
              const statusLabel =
                item.activityStatus === 'active'
                  ? t(locale, 'home.seriesActive')
                  : t(locale, 'home.seriesComplete');
              const statusClass =
                item.activityStatus === 'active'
                  ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
                  : 'border-white/[0.08] bg-white/[0.04] text-ink-muted';

              return (
                <li key={item.slug}>
                  <article className="surface-card surface-card-hover group h-full p-5 sm:p-6">
                    <Link href={`/series/${item.slug}`} className="flex h-full flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                        <p className="text-sm text-ink-muted">
                          {seriesArticleCountLabel(locale, item.postCount)}
                        </p>
                      </div>
                      <h2 className="font-display text-xl text-ink transition-colors duration-150 ease-out group-hover:text-accent-400">
                        {formatSeriesName(item.slug, locale, titles)}
                      </h2>
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">
                        {seriesDescription(locale, item)}
                      </p>
                      <span className="text-sm text-meta-400">{t(locale, 'home.seriesCta')} →</span>
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </ListLayout>
  );
}

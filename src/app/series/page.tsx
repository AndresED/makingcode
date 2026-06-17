import type { Metadata } from 'next';
import Link from 'next/link';
import { SeriesCard } from '@/components/blog/series-card';
import { ListLayout } from '@/components/layout/list-layout';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { listPublishedSeriesCatalog } from '@/lib/posts/series-repository';
import { buildSeriesIndexMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildSeriesIndexMetadata(locale);
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
            {series.map((item) => (
              <li key={item.slug}>
                <SeriesCard locale={locale} item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </ListLayout>
  );
}

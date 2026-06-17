import Link from 'next/link';
import { SeriesCard } from '@/components/blog/series-card';
import { t, type Locale } from '@/lib/i18n/dictionary';
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
          const latest = localizeLatestPost(locale, item);

          return (
            <li key={item.slug}>
              <SeriesCard
                locale={locale}
                item={item}
                footer={
                  latest ? (
                    <p className="text-sm leading-relaxed text-ink-body">
                      <span className="text-ink-muted">{t(locale, 'home.seriesLatest')}: </span>
                      <Link
                        href={`/blog/${latest.slug}`}
                        className="text-ink transition-colors duration-150 ease-out hover:text-accent-400"
                      >
                        {latest.title}
                      </Link>
                    </p>
                  ) : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

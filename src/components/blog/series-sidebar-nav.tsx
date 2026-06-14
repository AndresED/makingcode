import Link from 'next/link';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import { listPublishedSeriesCatalog } from '@/lib/posts/series-repository';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface SeriesSidebarNavProps {
  locale: Locale;
  activeSlug?: string;
}

export async function SeriesSidebarNav({ locale, activeSlug }: SeriesSidebarNavProps) {
  const series = await listPublishedSeriesCatalog();
  if (series.length === 0) return null;

  const hubActive = activeSlug === undefined;

  return (
    <nav aria-label={t(locale, 'sidebar.series')}>
      <p className="label-caps mb-3">{t(locale, 'sidebar.series')}</p>
      <ul className="space-y-0.5">
        <li>
          <Link
            href="/series"
            className={`sidebar-link ${hubActive ? 'sidebar-link-active' : ''}`}
            aria-current={hubActive ? 'page' : undefined}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                hubActive ? 'bg-accent-400' : 'bg-meta-500/60'
              }`}
              aria-hidden="true"
            />
            {t(locale, 'series.viewAll')}
          </Link>
        </li>
        {series.map((item) => {
          const active = activeSlug === item.slug;
          const titles = { title_en: item.title_en, title_es: item.title_es };
          return (
            <li key={item.slug}>
              <Link
                href={`/series/${item.slug}`}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${
                    active ? 'bg-accent-400' : 'bg-accent-500/60'
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block truncate">{formatSeriesName(item.slug, locale, titles)}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {seriesArticleCountLabel(locale, item.postCount)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

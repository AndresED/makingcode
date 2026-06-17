import type { ReactNode } from 'react';
import Link from 'next/link';
import { PostCoverImage } from '@/components/post-cover-image';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import { resolveSeriesDescription, type SeriesPresentationFields } from '@/lib/posts/series-presentation';
import type { SeriesActivityStatus } from '@/lib/posts/series-activity';

export interface SeriesCardItem extends SeriesPresentationFields {
  postCount: number;
  activityStatus: SeriesActivityStatus;
  cover_image_url?: string | null;
}

interface SeriesCardProps {
  locale: Locale;
  item: SeriesCardItem;
  footer?: ReactNode;
}

function statusBadgeClass(status: SeriesActivityStatus): string {
  return status === 'active'
    ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
    : 'border-white/[0.08] bg-white/[0.04] text-ink-muted';
}

export function SeriesCard({ locale, item, footer }: SeriesCardProps) {
  const titles = { title_en: item.title_en, title_es: item.title_es };
  const statusLabel =
    item.activityStatus === 'active'
      ? t(locale, 'home.seriesActive')
      : t(locale, 'home.seriesComplete');
  const seriesName = formatSeriesName(item.slug, locale, titles);
  const coverUrl = item.cover_image_url?.trim() || null;
  const seriesHref = `/series/${item.slug}`;

  return (
    <article className="surface-card surface-card-hover group flex h-full flex-col overflow-hidden">
      <Link href={seriesHref} className="block">
        <div className="relative aspect-[2/1] w-full overflow-hidden border-b border-white/[0.06] bg-dark-900/80">
          {coverUrl ? (
            <PostCoverImage
              src={coverUrl}
              alt=""
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-accent-500/20 via-dark-900 to-meta-500/10"
              aria-hidden
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(item.activityStatus)}`}
          >
            {statusLabel}
          </span>
          <p className="text-sm text-ink-muted">
            {seriesArticleCountLabel(locale, item.postCount)}
          </p>
        </div>

        <h2 className="font-display text-xl">
          <Link
            href={seriesHref}
            className="text-ink transition-colors duration-150 ease-out hover:text-accent-400"
          >
            {seriesName}
          </Link>
        </h2>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">
          {resolveSeriesDescription(locale, item)}
        </p>

        <Link
          href={seriesHref}
          className="text-sm text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
        >
          {t(locale, 'home.seriesCta')} →
        </Link>
      </div>

      {footer ? <div className="border-t border-white/[0.06] px-5 py-3 sm:px-6">{footer}</div> : null}
    </article>
  );
}

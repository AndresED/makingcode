import type { Locale } from '@/lib/i18n/dictionary';
import { formatSeriesName } from '@/lib/posts/format-series-name';

export interface SeriesPresentationFields {
  slug: string;
  title_en: string;
  title_es: string;
  description_en: string | null;
  description_es: string | null;
  cover_image_url?: string | null;
}

export function resolveSeriesDescription(
  locale: Locale,
  item: SeriesPresentationFields,
): string {
  const fromDb = locale === 'es' ? item.description_es : item.description_en;
  if (fromDb?.trim()) return fromDb.trim();

  const name = formatSeriesName(item.slug, locale, item);
  return locale === 'es'
    ? `Artículos ordenados sobre ${name}.`
    : `Ordered articles on ${name}.`;
}

export function seriesPresentationComplete(item: SeriesPresentationFields): boolean {
  const hasDescription =
    Boolean(item.description_en?.trim()) && Boolean(item.description_es?.trim());
  const hasCover = Boolean(item.cover_image_url?.trim());
  return hasDescription && hasCover;
}

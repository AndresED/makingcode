import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

const SERIES_LABELS: Partial<Record<string, Record<Locale, string>>> = {
  'nestjs-enterprise': {
    en: 'NestJS Enterprise',
    es: 'NestJS Enterprise',
  },
};

export function formatSeriesName(slug: string, locale: Locale = 'en'): string {
  const label = SERIES_LABELS[slug]?.[locale];
  if (label) return label;

  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function seriesArticleCountLabel(locale: Locale, count: number): string {
  const key = count === 1 ? 'series.articleCount' : 'series.articleCountPlural';
  return t(locale, key).replace('{count}', String(count));
}

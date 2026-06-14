import Link from 'next/link';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface PostAlternateLocaleChipProps {
  locale: Locale;
  alternateSlug: string;
}

export function PostAlternateLocaleChip({ locale, alternateSlug }: PostAlternateLocaleChipProps) {
  if (!alternateSlug.trim()) return null;

  const label = locale === 'es' ? t(locale, 'article.alternateLocaleEn') : t(locale, 'article.alternateLocaleEs');

  return (
    <Link
      href={`/blog/${alternateSlug}`}
      hrefLang={locale === 'es' ? 'en' : 'es'}
      className="inline-flex items-center gap-1.5 rounded-full border border-meta-500/25 bg-meta-500/10 px-3 py-1 text-xs text-meta-400 transition-colors duration-150 ease-out hover:border-meta-500/40 hover:text-ink"
    >
      {label} →
    </Link>
  );
}

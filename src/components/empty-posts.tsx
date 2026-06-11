import { t, type Locale } from '@/lib/i18n/dictionary';

interface EmptyPostsProps {
  locale: Locale;
}

export function EmptyPosts({ locale }: EmptyPostsProps) {
  return (
    <div className="surface-card px-6 py-12 text-center">
      <p className="text-ink-muted">{t(locale, 'home.empty')}</p>
    </div>
  );
}

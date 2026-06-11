import { t, type Locale } from '@/lib/i18n/dictionary';

interface EmptyPostsProps {
  locale: Locale;
}

export function EmptyPosts({ locale }: EmptyPostsProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-dark-800/60 px-6 py-10 text-center">
      <p className="text-ink-muted">{t(locale, 'home.empty')}</p>
    </div>
  );
}

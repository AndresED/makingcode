import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface EmptyPostsProps {
  locale: Locale;
}

export function EmptyPosts({ locale }: EmptyPostsProps) {
  return (
    <div className="surface-card space-y-5 px-6 py-12 text-center sm:px-10">
      <p className="mx-auto max-w-md text-base leading-relaxed text-ink-body">
        {t(locale, 'home.empty')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={siteConfig.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500/90 px-5 py-2.5 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90"
        >
          {t(locale, 'home.emptyCtaPortfolio')} ↗
        </a>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-dark-800/40 px-5 py-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
        >
          {t(locale, 'home.emptyCtaAbout')} →
        </Link>
      </div>
    </div>
  );
}

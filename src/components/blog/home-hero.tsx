import Link from 'next/link';
import { AuthorAvatar } from '@/components/author-avatar';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface HomeHeroProps {
  locale: Locale;
}

export function HomeHero({ locale }: HomeHeroProps) {
  const { author } = siteConfig;

  return (
    <header className="space-y-6">
      <div className="space-y-4">
        <p className="label-caps text-accent-400">{t(locale, 'home.eyebrow')}</p>
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
          {t(locale, 'home.title')}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-body">{t(locale, 'home.tagline')}</p>
        <p className="max-w-xl text-base text-ink-muted">{t(locale, 'home.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500/90 px-5 py-2.5 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90"
        >
          {t(locale, 'home.ctaBlog')} →
        </Link>
        <a
          href={author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-dark-800/40 px-5 py-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.16] hover:text-ink"
        >
          {t(locale, 'home.ctaPortfolio')} ↗
        </a>
      </div>

      <div className="surface-card flex items-center gap-4 p-4 sm:p-5">
        <AuthorAvatar size="sm" priority />
        <div className="min-w-0">
          <p className="font-medium text-ink">{author.name}</p>
          <p className="text-sm text-meta-400">
            {author.role} · {t(locale, 'home.authorLocation')}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t(locale, 'home.authorIntro')}</p>
        </div>
      </div>
    </header>
  );
}

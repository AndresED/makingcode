import Link from 'next/link';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { LocaleToggle } from '@/components/locale-toggle';
import { siteConfig } from '@/lib/seo/site';

interface SiteHeaderProps {
  locale: Locale;
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const nav = [
    { href: '/', label: t(locale, 'nav.home') },
    { href: '/blog', label: t(locale, 'nav.blog') },
    { href: '/about', label: t(locale, 'nav.about') },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-dark-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink-muted" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.author.url}
            className="hidden transition-colors hover:text-accent-500 sm:inline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(locale, 'nav.portfolio')} ↗
          </a>
          <LocaleToggle locale={locale} />
        </nav>
      </div>
    </header>
  );
}

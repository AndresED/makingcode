import Link from 'next/link';
import { AdminNav } from '@/components/admin-nav';
import { LocaleToggle } from '@/components/locale-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { NavLink } from '@/components/nav-link';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface SiteHeaderProps {
  locale: Locale;
  isAdmin?: boolean;
  unreadNewsletterCount?: number;
}

export function SiteHeader({
  locale,
  isAdmin = false,
  unreadNewsletterCount = 0,
}: SiteHeaderProps) {
  const nav = [
    { href: '/', label: t(locale, 'nav.home') },
    { href: '/blog', label: t(locale, 'nav.blog') },
    { href: '/about', label: t(locale, 'nav.about') },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-ink transition-opacity duration-150 ease-out hover:opacity-90"
        >
          <span
            className="flex size-7 items-center justify-center rounded-md bg-accent-500/15 text-xs font-bold text-accent-400"
            aria-hidden="true"
          >
            MC
          </span>
          <span className="font-display text-base font-medium tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 text-sm lg:flex"
          aria-label="Main"
        >
          {nav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
              activeClassName="bg-white/[0.05] text-ink"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="hidden lg:block">
              <AdminNav locale={locale} unreadNewsletterCount={unreadNewsletterCount} />
            </div>
          ) : null}
          <div className="hidden lg:block">
            <LocaleToggle locale={locale} />
          </div>
          <MobileNav
            locale={locale}
            isAdmin={isAdmin}
            unreadNewsletterCount={unreadNewsletterCount}
          />
        </div>
      </div>
    </header>
  );
}

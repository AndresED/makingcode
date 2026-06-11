'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin-nav';
import { BlogSearch } from '@/components/blog/blog-search';
import { CategoryNav } from '@/components/blog/category-nav';
import { LocaleToggle } from '@/components/locale-toggle';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
interface MobileNavProps {
  locale: Locale;
  isAdmin?: boolean;
  unreadNewsletterCount?: number;
}

export function MobileNav({
  locale,
  isAdmin = false,
  unreadNewsletterCount = 0,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const nav = [
    { href: '/', label: t(locale, 'nav.home') },
    { href: '/blog', label: t(locale, 'nav.blog') },
    { href: '/about', label: t(locale, 'nav.about') },
  ] as const;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        aria-expanded={open}
        aria-label={open ? t(locale, 'nav.close') : t(locale, 'nav.menu')}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div className="fixed inset-0 top-14 z-40 bg-dark-950/95 backdrop-blur-md">
          <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-7xl flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6">
            <BlogSearch locale={locale} />
            <nav className="flex flex-col gap-1" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base text-ink-body hover:bg-white/[0.04] hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <CategoryNav locale={locale} />
            <div className="mt-auto space-y-4">
              {isAdmin ? (
                <AdminNav
                  locale={locale}
                  variant="mobile"
                  onNavigate={() => setOpen(false)}
                  unreadNewsletterCount={unreadNewsletterCount}
                />
              ) : null}
              <div className="border-t border-white/[0.06] pt-4">
                <LocaleToggle locale={locale} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

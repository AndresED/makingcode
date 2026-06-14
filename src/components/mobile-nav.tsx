'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
}

export function MobileNav({
  locale,
  isAdmin = false,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const nav = [
    { href: '/', label: t(locale, 'nav.home') },
    { href: '/blog', label: t(locale, 'nav.blog') },
    { href: '/series', label: t(locale, 'nav.series') },
    { href: '/about', label: t(locale, 'nav.about') },
  ] as const;

  const menuPanel =
    open && mounted
      ? createPortal(
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t(locale, 'nav.menu')}
            className="fixed inset-x-0 bottom-0 top-14 z-40 bg-dark-950 lg:hidden"
          >
            <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 overflow-y-auto border-t border-white/[0.06] px-4 py-6 shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:px-6">
              <BlogSearch locale={locale} />
              <nav className="flex flex-col gap-1" aria-label="Main">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base text-ink-body transition-colors duration-150 ease-out hover:bg-white/[0.04] hover:text-ink"
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
                  />
                ) : null}
                <div className="border-t border-white/[0.06] pt-4">
                  <LocaleToggle locale={locale} />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative z-[60] flex size-9 items-center justify-center rounded-lg border border-white/[0.08] text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
        aria-expanded={open}
        aria-controls={open ? 'mobile-nav-panel' : undefined}
        aria-label={open ? t(locale, 'nav.close') : t(locale, 'nav.menu')}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {menuPanel}
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

'use client';

import Link from 'next/link';
import { signOutAction } from '@/lib/posts/actions';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface AdminNavProps {
  locale: Locale;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
  unreadNewsletterCount?: number;
}

export function AdminNav({
  locale,
  variant = 'desktop',
  onNavigate,
  unreadNewsletterCount = 0,
}: AdminNavProps) {
  const isMobile = variant === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'flex flex-col gap-1 border-t border-white/[0.06] pt-4'
          : 'flex items-center gap-1'
      }
      aria-label={t(locale, 'nav.admin')}
    >
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={
          isMobile
            ? 'inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-base text-accent-400 hover:bg-accent-500/10'
            : 'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-accent-400 transition-colors duration-150 ease-out hover:bg-accent-500/10 hover:text-accent-400'
        }
      >
        {t(locale, 'nav.dashboard')}
        {unreadNewsletterCount > 0 ? (
          <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-dark-950">
            {unreadNewsletterCount > 99 ? '99+' : unreadNewsletterCount}
          </span>
        ) : null}
      </Link>
      <form action={signOutAction} className={isMobile ? 'px-3' : undefined}>
        <button
          type="submit"
          className={
            isMobile
              ? 'w-full rounded-lg py-2.5 text-left text-base text-ink-muted hover:text-ink'
              : 'rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink'
          }
        >
          {t(locale, 'nav.signOut')}
        </button>
      </form>
    </div>
  );
}

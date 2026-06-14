'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardSignOut } from '@/components/dashboard/dashboard-sign-out';

interface DashboardSidebarProps {
  unreadNewsletterCount?: number;
}

interface NavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Posts',
    match: (pathname) =>
      pathname === '/dashboard' || pathname.startsWith('/dashboard/posts'),
  },
  {
    href: '/dashboard/series',
    label: 'Series',
    match: (pathname) => pathname.startsWith('/dashboard/series'),
  },
  {
    href: '/dashboard/newsletter',
    label: 'Newsletter',
    match: (pathname) => pathname.startsWith('/dashboard/newsletter'),
  },
];

function NavLinks({
  pathname,
  unreadNewsletterCount,
  onNavigate,
  className = '',
}: {
  pathname: string;
  unreadNewsletterCount: number;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ul className={`space-y-1 ${className}`}>
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        const badge = item.href === '/dashboard/newsletter' ? unreadNewsletterCount : 0;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ease-out ${
                active
                  ? 'bg-white/[0.08] font-medium text-ink'
                  : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <span className="flex items-center gap-2">
                {active ? (
                  <span className="size-1.5 rounded-full bg-accent-500" aria-hidden="true" />
                ) : (
                  <span className="size-1.5" aria-hidden="true" />
                )}
                {item.label}
              </span>
              {badge > 0 ? (
                <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-medium text-dark-950">
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardSidebar({ unreadNewsletterCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-6 hidden lg:block">
        <p className="label-caps text-meta-400">Dashboard</p>
        <p className="mt-1 font-display text-lg text-ink">Making Code</p>
      </div>

      <nav aria-label="Dashboard">
        <NavLinks
          pathname={pathname}
          unreadNewsletterCount={unreadNewsletterCount}
          onNavigate={() => setMobileOpen(false)}
        />
      </nav>

      <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-6">
        <Link
          href="/dashboard/posts/new"
          onClick={() => setMobileOpen(false)}
          className="flex w-full items-center justify-center rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90"
        >
          New post
        </Link>
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="block rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          View site →
        </Link>
        <DashboardSignOut />
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar-drawer"
        >
          <MenuIcon />
          Menu
        </button>
        <Link
          href="/dashboard/posts/new"
          className="rounded-lg bg-accent-500 px-3 py-2 text-sm font-medium text-dark-950"
        >
          New post
        </Link>
      </div>

      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">{sidebarContent}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="dashboard-sidebar-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-dvh w-[min(18rem,85vw)] flex-col border-r border-white/[0.06] bg-dark-900 px-4 py-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="label-caps text-meta-400">Dashboard</p>
                <p className="mt-1 font-display text-lg text-ink">Making Code</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] text-ink-muted hover:text-ink"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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

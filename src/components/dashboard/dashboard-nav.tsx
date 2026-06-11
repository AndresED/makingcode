import Link from 'next/link';

interface DashboardNavProps {
  unreadNewsletterCount?: number;
}

export function DashboardNav({ unreadNewsletterCount = 0 }: DashboardNavProps) {
  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm">
      <Link href="/dashboard" className="text-ink-muted transition-colors hover:text-ink">
        Posts
      </Link>
      <Link
        href="/dashboard/newsletter"
        className="inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
      >
        Newsletter
        {unreadNewsletterCount > 0 ? (
          <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-medium text-dark-950">
            {unreadNewsletterCount > 99 ? '99+' : unreadNewsletterCount}
          </span>
        ) : null}
      </Link>
      <Link href="/dashboard/posts/new" className="text-meta-500 transition-colors hover:text-ink">
        New post
      </Link>
    </nav>
  );
}

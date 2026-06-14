import type { Metadata } from 'next';
import Link from 'next/link';
import { PostList } from '@/components/dashboard/post-list';
import { getAnalyticsDashboardReport } from '@/lib/analytics/first-party-stats';
import { countUnreadNewsletterSubscribers } from '@/lib/newsletter/repository';
import { listAllPostsForAdmin } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [posts, unreadNewsletterCount, analytics] = await Promise.all([
    listAllPostsForAdmin(),
    countUnreadNewsletterSubscribers(),
    getAnalyticsDashboardReport(),
  ]);
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;

  return (
    <section className="space-y-6">
      {analytics.configured && analytics.period7d && !analytics.error ? (
        <Link
          href="/dashboard/analytics"
          className="surface-card flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
        >
          <div>
            <p className="text-sm font-medium text-ink">Site analytics</p>
            <p className="mt-1 text-sm text-ink-muted">
              {analytics.period7d.pageviews.toLocaleString()} pageviews ·{' '}
              {analytics.period7d.visitors.toLocaleString()} visitors (7d)
            </p>
          </div>
          <span className="shrink-0 text-sm text-accent-400">View report →</span>
        </Link>
      ) : null}

      {unreadNewsletterCount > 0 ? (
        <Link
          href="/dashboard/newsletter"
          className="surface-card flex items-center justify-between gap-4 border-accent-500/25 bg-accent-500/10 px-5 py-4 transition-colors hover:bg-accent-500/15"
        >
          <div>
            <p className="text-sm font-medium text-ink">New newsletter subscribers</p>
            <p className="mt-1 text-sm text-ink-muted">
              {unreadNewsletterCount} new{' '}
              {unreadNewsletterCount === 1 ? 'subscription' : 'subscriptions'} to review
            </p>
          </div>
          <span className="shrink-0 text-sm text-accent-400">View →</span>
        </Link>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Posts</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {published} published · {drafts} drafts
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 ease-out hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="surface-card px-6 py-10 text-center">
          <p className="text-ink-muted">No posts yet. Create your first draft.</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </section>
  );
}

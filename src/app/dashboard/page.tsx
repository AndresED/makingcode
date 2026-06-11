import type { Metadata } from 'next';
import Link from 'next/link';
import { listAllPostsForAdmin } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const posts = await listAllPostsForAdmin();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Posts</h1>
        <Link
          href="/dashboard/posts/new"
          className="rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-white"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-ink-muted">No posts yet. Create your first draft.</p>
      ) : (
        <ul className="divide-y divide-white/8 rounded-xl border border-white/8">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Link
                  href={`/dashboard/posts/${post.id}/edit`}
                  className="font-medium text-ink hover:text-accent-500"
                >
                  {post.title_en}
                </Link>
                <p className="text-xs text-ink-muted">
                  {post.title_es} · EN /blog/{post.slug_en} · ES /blog/{post.slug_es} ·{' '}
                  {post.status}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  post.status === 'published'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {post.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

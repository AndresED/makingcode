import Link from 'next/link';
import { listTopPublicationsForAdmin } from '@/lib/analytics/post-views';
import type { PostRecord } from '@/lib/posts/types';

interface TopPublicationsPanelProps {
  posts: PostRecord[];
}

function formatViews(count: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    count,
  );
}

export async function TopPublicationsPanel({ posts }: TopPublicationsPanelProps) {
  const top = await listTopPublicationsForAdmin(posts, 30, 8);

  if (top.length === 0) return null;

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="font-display text-lg text-ink">Top publications (30d)</h2>
        <p className="mt-1 text-sm text-ink-muted">Mapped from /blog/* pageviews in Supabase.</p>
      </div>
      <ol className="divide-y divide-white/[0.06]">
        {top.map((item, index) => (
          <li key={item.post.id}>
            <Link
              href={`/dashboard/posts/${item.post.id}/edit`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
            >
              <span className="w-6 shrink-0 font-mono text-sm text-accent-400">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium text-ink">{item.post.title_en}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  /blog/{item.post.slug_en}
                </p>
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="font-medium text-ink">{formatViews(item.stats.pageviews)}</p>
                <p className="text-xs text-ink-muted">views</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

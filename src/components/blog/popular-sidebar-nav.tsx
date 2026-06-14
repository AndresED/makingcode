import Link from 'next/link';
import { listMostViewedPublishedPosts } from '@/lib/analytics/post-views';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface PopularSidebarNavProps {
  locale: Locale;
  limit?: number;
}

export async function PopularSidebarNav({ locale, limit = 5 }: PopularSidebarNavProps) {
  const posts = await listMostViewedPublishedPosts(locale, limit);

  if (posts.length === 0) return null;

  return (
    <nav aria-label={t(locale, 'sidebar.popular')}>
      <p className="label-caps mb-3">{t(locale, 'sidebar.popular')}</p>
      <ol className="space-y-3">
        {posts.map((post, index) => (
          <li key={post.id} className="flex gap-3">
            <span className="mt-0.5 font-mono text-xs text-accent-400/80">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Link
              href={`/blog/${post.slug}`}
              className="group min-w-0 flex-1 rounded-lg px-1 py-0.5 transition-colors duration-150 ease-out hover:text-ink"
            >
              <span className="line-clamp-2 text-sm leading-snug text-ink-body group-hover:text-accent-400">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

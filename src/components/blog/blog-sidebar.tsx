import Link from 'next/link';
import { BlogSearch } from '@/components/blog/blog-search';
import { CategoryNav } from '@/components/blog/category-nav';
import { PopularSidebarNav } from '@/components/blog/popular-sidebar-nav';
import { SeriesSidebarNav } from '@/components/blog/series-sidebar-nav';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import type { PostSummary } from '@/lib/posts/types';

interface BlogSidebarProps {
  locale: Locale;
  recentPosts?: PostSummary[];
  activeCategory?: string;
  activeSeriesSlug?: string;
  showRecent?: boolean;
}

export function BlogSidebar({
  locale,
  recentPosts = [],
  activeCategory,
  activeSeriesSlug,
  showRecent = true,
}: BlogSidebarProps) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-8">
      <div>
        <p className="label-caps mb-3">{t(locale, 'sidebar.explore')}</p>
        <BlogSearch locale={locale} />
      </div>

      <CategoryNav locale={locale} activeCategory={activeCategory} />

      <SeriesSidebarNav locale={locale} activeSlug={activeSeriesSlug} />

      <PopularSidebarNav locale={locale} />

      {showRecent && recentPosts.length > 0 ? (
        <nav aria-label={t(locale, 'sidebar.recent')}>
          <p className="label-caps mb-3">{t(locale, 'sidebar.recent')}</p>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-lg px-1 py-0.5 transition-colors duration-150 ease-out hover:text-ink"
                >
                  <span className="line-clamp-2 text-sm leading-snug text-ink-body group-hover:text-accent-400">
                    {post.title}
                  </span>
                  <time
                    dateTime={post.published_at}
                    className="mt-1 block text-xs text-ink-muted"
                  >
                    {formatShortDate(post.published_at, locale)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="border-t border-white/[0.06] pt-6">
        <a
          href="/api/feed"
          className="sidebar-link text-meta-400 hover:text-meta-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RssIcon />
          {t(locale, 'sidebar.rss')}
        </a>
      </div>
    </aside>
  );
}

function formatShortDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function RssIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M4 12a6 6 0 0 1 6 6v1H4v-7Zm0-4a10 10 0 0 1 10 10v1H4V8Zm2 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

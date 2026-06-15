import Link from 'next/link';
import { BlogSearch } from '@/components/blog/blog-search';
import { CategoryNav } from '@/components/blog/category-nav';
import { NewsletterForm } from '@/components/blog/newsletter-form';
import { PopularSidebarNav } from '@/components/blog/popular-sidebar-nav';
import { SeriesSidebarNav } from '@/components/blog/series-sidebar-nav';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { SIDEBAR_POPULAR_LIMIT, SIDEBAR_RECENT_LIMIT } from '@/lib/posts/constants';
import type { PostSummary } from '@/lib/posts/types';

export type BlogSidebarVariant = 'default' | 'home';

interface BlogSidebarProps {
  locale: Locale;
  recentPosts?: PostSummary[];
  activeCategory?: string;
  activeSeriesSlug?: string;
  showRecent?: boolean;
  variant?: BlogSidebarVariant;
}

export function BlogSidebar({
  locale,
  recentPosts = [],
  activeCategory,
  activeSeriesSlug,
  showRecent = true,
  variant = 'default',
}: BlogSidebarProps) {
  const recentItems = recentPosts.slice(0, SIDEBAR_RECENT_LIMIT);

  if (variant === 'home') {
    return (
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <p className="label-caps mb-3">{t(locale, 'sidebar.explore')}</p>
          <BlogSearch locale={locale} />
        </div>

        <CategoryNav locale={locale} activeCategory={activeCategory} variant="wrap" />

        <nav aria-label={t(locale, 'sidebar.discover')}>
          <p className="label-caps mb-3">{t(locale, 'sidebar.discover')}</p>
          <ul className="space-y-0.5">
            <li>
              <Link href="/series" className="sidebar-link">
                <span className="size-1.5 shrink-0 rounded-full bg-accent-500/60" aria-hidden="true" />
                {t(locale, 'series.viewAll')}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="sidebar-link">
                <span className="size-1.5 shrink-0 rounded-full bg-meta-500/60" aria-hidden="true" />
                {t(locale, 'home.ctaBlog')}
              </Link>
            </li>
          </ul>
        </nav>

        <NewsletterForm locale={locale} variant="sidebar" />

        <div className="border-t border-white/[0.06] pt-4">
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

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div>
        <p className="label-caps mb-3">{t(locale, 'sidebar.explore')}</p>
        <BlogSearch locale={locale} />
      </div>

      <CategoryNav locale={locale} activeCategory={activeCategory} />

      <SeriesSidebarNav locale={locale} activeSlug={activeSeriesSlug} />

      <PopularSidebarNav locale={locale} limit={SIDEBAR_POPULAR_LIMIT} />

      {showRecent && recentItems.length > 0 ? (
        <nav aria-label={t(locale, 'sidebar.recent')}>
          <p className="label-caps mb-3">{t(locale, 'sidebar.recent')}</p>
          <ul className="space-y-3">
            {recentItems.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-lg px-1 py-0.5 transition-colors duration-150 ease-out hover:text-ink"
                >
                  <span className="line-clamp-2 text-sm leading-snug text-ink-body group-hover:text-accent-400">
                    {post.title}
                  </span>
                  <time dateTime={post.published_at} className="mt-1 block text-xs text-ink-muted">
                    {formatShortDate(post.published_at, locale)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="border-t border-white/[0.06] pt-4">
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

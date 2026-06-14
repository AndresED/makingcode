import Link from 'next/link';
import type { Metadata } from 'next';
import { FeaturedPostCard } from '@/components/blog/featured-post-card';
import { HomeHero } from '@/components/blog/home-hero';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { HOME_POSTS_LIMIT, MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { buildHomeMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildHomeMetadata(locale);
}

export default async function HomePage() {
  const locale = await getLocale();
  const { posts, total } = await listPublishedPosts({ page: 1, pageSize: HOME_POSTS_LIMIT });
  const [featured, ...rest] = posts;
  const showViewAll = total > HOME_POSTS_LIMIT;
  const showRecent = total >= MIN_POSTS_FOR_SIDEBAR_RECENT;

  return (
    <ListLayout
      locale={locale}
      recentPosts={posts.slice(0, 5)}
      showMobileExplore
      showRecent={showRecent}
    >
      <section className="space-y-10">
        <HomeHero locale={locale} />

        {posts.length === 0 ? (
          <EmptyPosts locale={locale} />
        ) : (
          <>
            {featured ? <FeaturedPostCard post={featured} locale={locale} /> : null}

            {rest.length > 0 ? (
              <div className="space-y-6">
                <h2 className="font-display text-xl text-ink">{t(locale, 'home.recent')}</h2>
                <PostGrid posts={rest} locale={locale} />
              </div>
            ) : null}

            {showViewAll ? (
              <div className="flex justify-center pt-2">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-dark-800/40 px-5 py-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
                >
                  {t(locale, 'home.viewAll')} →
                </Link>
              </div>
            ) : null}
          </>
        )}
      </section>
    </ListLayout>
  );
}

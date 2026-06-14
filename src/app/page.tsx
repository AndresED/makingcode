import Link from 'next/link';
import type { Metadata } from 'next';
import { FeaturedPostCard } from '@/components/blog/featured-post-card';
import { HomeHero } from '@/components/blog/home-hero';
import { HomeSeriesBlock } from '@/components/blog/home-series-block';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { HOME_POSTS_LIMIT, MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts, listPublishedPostsInSeries, listPublishedSeries } from '@/lib/posts/repository';
import { buildHomeMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildHomeMetadata(locale);
}

export default async function HomePage() {
  const locale = await getLocale();
  const { posts, total } = await listPublishedPosts({ page: 1, pageSize: HOME_POSTS_LIMIT });
  const seriesList = await listPublishedSeries();
  const primarySeries = seriesList[0] ?? null;
  const allSeriesPosts = primarySeries
    ? await listPublishedPostsInSeries(primarySeries.slug, locale)
    : [];

  const featured = posts[0] ?? null;
  const featuredId = featured?.id ?? null;
  const seriesPostIds = new Set(allSeriesPosts.map((post) => post.id));

  const seriesPostsForHome = allSeriesPosts.filter((post) => post.id !== featuredId);
  const recentPosts = posts.filter(
    (post) => post.id !== featuredId && !seriesPostIds.has(post.id),
  );

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

            {primarySeries && seriesPostsForHome.length > 0 ? (
              <HomeSeriesBlock
                locale={locale}
                seriesSlug={primarySeries.slug}
                posts={seriesPostsForHome}
                totalInSeries={allSeriesPosts.length}
              />
            ) : null}

            {recentPosts.length > 0 ? (
              <div className="space-y-6">
                <h2 className="font-display text-xl text-ink">{t(locale, 'home.recent')}</h2>
                <PostGrid posts={recentPosts} locale={locale} />
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

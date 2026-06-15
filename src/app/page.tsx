import Link from 'next/link';
import type { Metadata } from 'next';
import { FeaturedPostCard } from '@/components/blog/featured-post-card';
import { HomeHero } from '@/components/blog/home-hero';
import { HomeSeriesGrid } from '@/components/blog/home-series-grid';
import { NewsletterForm } from '@/components/blog/newsletter-form';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { HOME_POSTS_LIMIT, HOME_SERIES_STRIP_MAX } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { listPublishedSeriesForHome } from '@/lib/posts/series-repository';
import { buildHomeMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildHomeMetadata(locale);
}

export default async function HomePage() {
  const locale = await getLocale();

  const [{ posts, total }, seriesForHome] = await Promise.all([
    listPublishedPosts({ page: 1, pageSize: HOME_POSTS_LIMIT }),
    listPublishedSeriesForHome(),
  ]);

  const featured = posts[0] ?? null;
  const featuredId = featured?.id ?? null;
  const recentPosts = posts.filter((post) => post.id !== featuredId);

  const showAllSeries = seriesForHome.length > 0 && seriesForHome.length <= HOME_SERIES_STRIP_MAX;
  const showFeaturedSeries = seriesForHome.length > HOME_SERIES_STRIP_MAX;

  const showViewAll = total > HOME_POSTS_LIMIT;

  return (
    <ListLayout
      locale={locale}
      recentPosts={posts.slice(0, 3)}
      showMobileExplore
      showRecent={false}
      sidebarVariant="home"
    >
      <section className="space-y-8">
        <HomeHero locale={locale} compact={posts.length > 0} />

        {posts.length === 0 ? (
          <EmptyPosts locale={locale} />
        ) : (
          <>
            {featured ? <FeaturedPostCard post={featured} locale={locale} /> : null}

            {showAllSeries ? <HomeSeriesGrid locale={locale} items={seriesForHome} /> : null}

            {showFeaturedSeries ? (
              <HomeSeriesGrid
                locale={locale}
                items={seriesForHome.slice(0, 1)}
                showViewAllLink
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

            <div className="lg:hidden">
              <NewsletterForm locale={locale} variant="card" />
            </div>
          </>
        )}
      </section>
    </ListLayout>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { searchPublishedContent } from '@/lib/posts/search';
import { buildBlogMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 300;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const locale = await getLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  if (query.length >= 2) {
    return buildBlogMetadata(locale, { query });
  }

  const { totalPages } = await listPublishedPosts({ page, locale });
  return buildBlogMetadata(locale, { page, totalPages });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const isSearch = query.length >= 2;
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  const [recentResult, result] = await Promise.all([
    listPublishedPosts({ page: 1, pageSize: 5, locale }),
    isSearch
      ? searchPublishedContent(query, locale, 50).then(({ posts, series }) => ({
          posts,
          series,
          page: 1,
          totalPages: 1,
          total: posts.length,
        }))
      : listPublishedPosts({ page, locale }).then((data) => ({
          ...data,
          series: [] as const,
        })),
  ]);

  const resultCount = result.posts.length + (isSearch ? result.series.length : 0);

  return (
    <ListLayout
      locale={locale}
      recentPosts={recentResult.posts}
      showMobileExplore
      showRecent={recentResult.total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
    >
      <section className="space-y-8">
        <header className="space-y-4">
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {isSearch ? t(locale, 'blog.results') : t(locale, 'blog.title')}
          </h1>
          {isSearch ? (
            <p className="text-ink-muted">
              &ldquo;{query}&rdquo; —{' '}
              {resultCount === 1
                ? t(locale, 'blog.resultCount').replace('{count}', String(resultCount))
                : t(locale, 'blog.resultCountPlural').replace('{count}', String(resultCount))}
            </p>
          ) : (
            <p className="text-ink-muted">{t(locale, 'home.subtitle')}</p>
          )}
        </header>

        {result.posts.length === 0 && result.series.length === 0 ? (
          <EmptyPosts locale={locale} />
        ) : (
          <>
            {isSearch && result.series.length > 0 ? (
              <section className="space-y-4">
                <h2 className="font-display text-lg text-ink">{t(locale, 'blog.searchSeries')}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {result.series.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/series/${item.slug}`}
                        className="surface-card surface-card-hover block p-4 transition-colors duration-150 ease-out"
                      >
                        <p className="font-medium text-ink">{item.title}</p>
                        {item.excerpt ? (
                          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.excerpt}</p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {result.posts.length > 0 ? (
              <PostGrid posts={result.posts} locale={locale} />
            ) : null}

            {!isSearch ? (
              <Pagination
                basePath="/blog"
                page={result.page}
                totalPages={result.totalPages}
                labels={{
                  prev: t(locale, 'pagination.prev'),
                  next: t(locale, 'pagination.next'),
                  page: t(locale, 'pagination.page'),
                  of: t(locale, 'pagination.of'),
                }}
              />
            ) : null}
          </>
        )}
      </section>
    </ListLayout>
  );
}

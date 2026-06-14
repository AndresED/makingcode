import type { Metadata } from 'next';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { searchPublishedPosts } from '@/lib/posts/search';
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

  const { totalPages } = await listPublishedPosts({ page });
  return buildBlogMetadata(locale, { page, totalPages });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const isSearch = query.length >= 2;
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  const recentResult = await listPublishedPosts({ page: 1, pageSize: 5 });
  const result = isSearch
    ? {
        posts: await searchPublishedPosts(query, locale, 50),
        page: 1,
        totalPages: 1,
        total: 0,
      }
    : await listPublishedPosts({ page });

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
              {result.posts.length === 1
                ? t(locale, 'blog.resultCount').replace('{count}', String(result.posts.length))
                : t(locale, 'blog.resultCountPlural').replace('{count}', String(result.posts.length))}
            </p>
          ) : (
            <p className="text-ink-muted">{t(locale, 'home.subtitle')}</p>
          )}
        </header>

        {result.posts.length === 0 ? (
          <EmptyPosts locale={locale} />
        ) : (
          <>
            <PostGrid posts={result.posts} locale={locale} />
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

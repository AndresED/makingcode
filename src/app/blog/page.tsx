import type { Metadata } from 'next';
import { BlogSearch } from '@/components/blog/blog-search';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { listPublishedPosts } from '@/lib/posts/repository';
import { searchPublishedPosts } from '@/lib/posts/search';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on backend engineering, cloud, and software architecture.',
};

export const revalidate = 3600;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
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
    <ListLayout locale={locale} recentPosts={recentResult.posts}>
      <section className="space-y-8">
        <header className="space-y-4">
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {isSearch ? t(locale, 'blog.results') : t(locale, 'blog.title')}
          </h1>
          {isSearch ? (
            <p className="text-ink-muted">
              &ldquo;{query}&rdquo; — {result.posts.length}{' '}
              {result.posts.length === 1 ? 'result' : 'results'}
            </p>
          ) : (
            <p className="text-ink-muted">{t(locale, 'home.subtitle')}</p>
          )}
          <div className="lg:hidden">
            <BlogSearch locale={locale} />
          </div>
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

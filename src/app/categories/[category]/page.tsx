import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyPosts } from '@/components/empty-posts';
import { ListLayout } from '@/components/layout/list-layout';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { categoryLabel } from '@/lib/i18n/category';
import { categoryDescription } from '@/lib/i18n/category-copy';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { isPostCategory } from '@/lib/posts/categories';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { buildCategoryMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isPostCategory(category)) return { title: 'Not found' };

  const locale = await getLocale();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const { totalPages } = await listPublishedPosts({ page, category });

  return buildCategoryMetadata(locale, category, { page, totalPages });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  if (!isPostCategory(category)) notFound();

  const locale = await getLocale();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const [result, recentResult] = await Promise.all([
    listPublishedPosts({ page, category }),
    listPublishedPosts({ page: 1, pageSize: 5 }),
  ]);

  const countLabel =
    result.total === 1
      ? t(locale, 'category.articleCount').replace('{count}', String(result.total))
      : t(locale, 'category.articleCountPlural').replace('{count}', String(result.total));

  return (
    <ListLayout
      locale={locale}
      recentPosts={recentResult.posts}
      activeCategory={category}
      showMobileExplore
      showRecent={recentResult.total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
    >
      <section className="space-y-8">
        <header className="space-y-4">
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {categoryLabel(locale, category)}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
            {categoryDescription(locale, category)}
          </p>
          <p className="text-sm text-ink-muted">{countLabel}</p>
        </header>

        {result.posts.length === 0 ? (
          <EmptyPosts locale={locale} />
        ) : (
          <>
            <PostGrid posts={result.posts} locale={locale} />
            <Pagination
              basePath={`/categories/${category}`}
              page={result.page}
              totalPages={result.totalPages}
              labels={{
                prev: t(locale, 'pagination.prev'),
                next: t(locale, 'pagination.next'),
                page: t(locale, 'pagination.page'),
                of: t(locale, 'pagination.of'),
              }}
            />
          </>
        )}
      </section>
    </ListLayout>
  );
}

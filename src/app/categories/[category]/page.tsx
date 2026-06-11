import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyPosts } from '@/components/empty-posts';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { categoryLabel } from '@/lib/i18n/category';
import { getLocale } from '@/lib/i18n/locale';
import { isPostCategory } from '@/lib/posts/categories';
import { listPublishedPosts } from '@/lib/posts/repository';

export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isPostCategory(category)) return { title: 'Not found' };
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: label,
    description: `Articles in ${label} on Making Code.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  if (!isPostCategory(category)) notFound();

  const locale = await getLocale();
  const query = await searchParams;
  const page = Math.max(1, Number(query.page ?? '1') || 1);
  const result = await listPublishedPosts({ page, category });

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">
          {categoryLabel(locale, category)}
        </h1>
        <p className="text-ink-muted">{result.total} article{result.total === 1 ? '' : 's'}</p>
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
          />
        </>
      )}
    </section>
  );
}

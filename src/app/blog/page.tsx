import type { Metadata } from 'next';
import { EmptyPosts } from '@/components/empty-posts';
import { Pagination } from '@/components/pagination';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { listPublishedPosts } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on backend engineering, cloud, and software architecture.',
};

export const revalidate = 3600;

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1') || 1);
  const result = await listPublishedPosts({ page });

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">{t(locale, 'nav.blog')}</h1>
        <p className="text-ink-muted">{t(locale, 'home.subtitle')}</p>
      </header>

      {result.posts.length === 0 ? (
        <EmptyPosts locale={locale} />
      ) : (
        <>
          <PostGrid posts={result.posts} locale={locale} />
          <Pagination basePath="/blog" page={result.page} totalPages={result.totalPages} />
        </>
      )}
    </section>
  );
}

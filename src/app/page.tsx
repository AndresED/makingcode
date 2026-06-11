import Link from 'next/link';
import { EmptyPosts } from '@/components/empty-posts';
import { PostGrid } from '@/components/post-grid';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { HOME_POSTS_LIMIT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';

export const revalidate = 3600;

export default async function HomePage() {
  const locale = await getLocale();
  const { posts } = await listPublishedPosts({ page: 1, pageSize: HOME_POSTS_LIMIT });

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t(locale, 'home.title')}
        </h1>
        <p className="max-w-2xl text-lg text-ink-muted">{t(locale, 'home.subtitle')}</p>
      </div>

      {posts.length === 0 ? (
        <EmptyPosts locale={locale} />
      ) : (
        <>
          <PostGrid posts={posts} locale={locale} />
          <div className="text-center">
            <Link
              href="/blog"
              className="text-sm text-meta-500 transition-colors hover:text-ink"
            >
              View all articles →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

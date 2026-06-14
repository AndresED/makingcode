import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListLayout } from '@/components/layout/list-layout';
import { categoryLabel } from '@/lib/i18n/category';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { formatSeriesName } from '@/lib/posts/format-series-name';
import { listPublishedPosts, listPublishedPostsInSeries } from '@/lib/posts/repository';
import { buildSeriesMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 3600;

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const ordered = await listPublishedPostsInSeries(slug, locale);
  if (ordered.length === 0) {
    return { title: formatSeriesName(slug) };
  }
  return buildSeriesMetadata(locale, slug, ordered.length);
}

function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const [ordered, recentResult] = await Promise.all([
    listPublishedPostsInSeries(slug, locale),
    listPublishedPosts({ page: 1, pageSize: 5 }),
  ]);

  if (ordered.length === 0) notFound();

  return (
    <ListLayout
      locale={locale}
      recentPosts={recentResult.posts}
      showRecent={recentResult.total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
    >
      <section className="space-y-8">
        <header className="space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
          >
            ← {t(locale, 'article.back')}
          </Link>
          <p className="label-caps text-accent-400">{t(locale, 'article.series')}</p>
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {formatSeriesName(slug)}
          </h1>
          <p className="text-ink-muted">
            {ordered.length} {ordered.length === 1 ? 'article' : 'articles'}
          </p>
        </header>

        <ol className="space-y-4">
          {ordered.map((post, index) => (
            <li key={post.id}>
              <article className="surface-card surface-card-hover group p-5 sm:p-6">
                <Link href={`/blog/${post.slug}`} className="block space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span className="font-mono text-accent-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-meta-400">
                      {categoryLabel(locale, post.category)}
                    </span>
                    <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
                    <span aria-hidden="true">·</span>
                    <span>
                      {post.reading_time_minutes} {t(locale, 'article.minRead')}
                    </span>
                  </div>
                  <h2 className="text-xl font-medium text-ink transition-colors duration-150 ease-out group-hover:text-accent-400">
                    {post.title}
                  </h2>
                  <p className="line-clamp-2 text-sm leading-relaxed text-ink-body">{post.excerpt}</p>
                  <span className="text-sm text-meta-400 group-hover:text-ink">
                    {t(locale, 'article.read')} →
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </ListLayout>
  );
}

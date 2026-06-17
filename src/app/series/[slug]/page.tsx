import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/blog/breadcrumbs';
import { ListLayout } from '@/components/layout/list-layout';
import { PostCoverImage } from '@/components/post-cover-image';
import { categoryLabel } from '@/lib/i18n/category';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { formatSeriesName, seriesArticleCountLabel } from '@/lib/posts/format-series-name';
import { listPublishedPosts, listPublishedPostsInSeries } from '@/lib/posts/repository';
import { resolveSeriesDescription } from '@/lib/posts/series-presentation';
import { getPostSeriesBySlug } from '@/lib/posts/series-repository';
import { buildSeriesMetadata } from '@/lib/seo/page-metadata';
import { buildSeriesItemListJsonLd } from '@/lib/seo/json-ld';

export const revalidate = 3600;

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const [ordered, series] = await Promise.all([
    listPublishedPostsInSeries(slug, locale),
    getPostSeriesBySlug(slug),
  ]);
  const titles = series ? { title_en: series.title_en, title_es: series.title_es } : null;
  if (ordered.length === 0) {
    return { title: formatSeriesName(slug, locale, titles) };
  }
  return buildSeriesMetadata(locale, slug, ordered.length, series);
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
  const [ordered, recentResult, series] = await Promise.all([
    listPublishedPostsInSeries(slug, locale),
    listPublishedPosts({ page: 1, pageSize: 5 }),
    getPostSeriesBySlug(slug),
  ]);

  if (ordered.length === 0) notFound();

  const titles = series ? { title_en: series.title_en, title_es: series.title_es } : null;
  const seriesName = formatSeriesName(slug, locale, titles);
  const coverUrl = series?.cover_image_url?.trim() || null;
  const description =
    series != null
      ? resolveSeriesDescription(locale, series)
      : seriesName;

  const itemListJsonLd = buildSeriesItemListJsonLd(
    slug,
    seriesName,
    ordered.map((post) => ({ slug: post.slug, title: post.title })),
  );

  return (
    <ListLayout
      locale={locale}
      recentPosts={recentResult.posts}
      showRecent={recentResult.total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
      activeSeriesSlug={slug}
    >
      <section className="space-y-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <header className="space-y-5">
          <Breadcrumbs
            items={[
              { label: t(locale, 'article.backToSeries'), href: '/series' },
              { label: seriesName },
            ]}
          />

          {coverUrl ? (
            <div className="relative aspect-[2/1] w-full max-w-3xl overflow-hidden rounded-xl border border-white/[0.08]">
              <PostCoverImage
                src={coverUrl}
                alt=""
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="label-caps text-accent-400">{t(locale, 'article.series')}</p>
            <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
              {seriesName}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-body sm:text-base">
              {description}
            </p>
            <p className="text-sm text-ink-muted">{seriesArticleCountLabel(locale, ordered.length)}</p>
          </div>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AuthorCard } from '@/components/blog/author-card';
import { BackToTop } from '@/components/blog/back-to-top';
import { CodeCopyEnhancer } from '@/components/blog/code-copy-enhancer';
import { PostToc } from '@/components/blog/post-toc';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { RelatedPosts } from '@/components/blog/related-posts';
import { SeriesNav } from '@/components/blog/series-nav';
import { PostCoverFallback } from '@/components/post-cover-fallback';
import { PostContent } from '@/components/post-content';
import { PostCoverImage } from '@/components/post-cover-image';
import { categoryLabel } from '@/lib/i18n/category';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { extractTocFromMarkdown } from '@/lib/markdown/toc';
import {
  getPublishedPostBySlug,
  listPublishedSlugs,
  listRelatedPosts,
  listSeriesPosts,
} from '@/lib/posts/repository';
import { buildArticleJsonLd, buildPostMetadata } from '@/lib/seo/post-metadata';
import { siteConfig } from '@/lib/seo/site';

export const revalidate = 3600;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPublishedPostBySlug(slug, locale);
  if (!post) return { title: 'Not found' };
  return buildPostMetadata(post, locale);
}

function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPublishedPostBySlug(slug, locale);
  if (!post) notFound();

  if (post.slug !== slug) {
    redirect(`/blog/${post.slug}`);
  }

  const [relatedPosts, seriesPosts] = await Promise.all([
    listRelatedPosts(post.id, post.category, locale),
    post.series_slug ? listSeriesPosts(post.series_slug, locale) : Promise.resolve([]),
  ]);

  const toc = extractTocFromMarkdown(post.body_md);
  const jsonLd = buildArticleJsonLd(post, locale);

  return (
    <>
      <ReadingProgress />
      <BackToTop locale={locale} />
      <div
        className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] xl:gap-16"
        data-slug-en={post.slug_en}
        data-slug-es={post.slug_es}
      >
        <article className="min-w-0" data-article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
          >
            ← {t(locale, 'article.back')}
          </Link>

          {post.series_slug ? (
            <SeriesNav
              seriesSlug={post.series_slug}
              posts={seriesPosts}
              currentPostId={post.id}
              locale={locale}
            />
          ) : null}

          <header className="mb-8 space-y-5 border-b border-white/[0.06] pb-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Link
                href={`/categories/${post.category}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
              >
                {categoryLabel(locale, post.category)}
              </Link>
              <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
              <span aria-hidden="true">·</span>
              <span>
                {post.reading_time_minutes} {t(locale, 'article.minRead')}
              </span>
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {post.title}
            </h1>
            <p className="text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>
          </header>

          <figure className="mb-10 overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="relative aspect-[2/1] w-full bg-dark-900">
              {post.cover_image_url ? (
                <PostCoverImage
                  src={post.cover_image_url}
                  alt={post.title}
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              ) : (
                <PostCoverFallback
                  category={post.category}
                  title={post.title}
                  locale={locale}
                  variant="featured"
                />
              )}
            </div>
          </figure>

          <PostContent bodyMd={post.body_md} />
          <CodeCopyEnhancer />
          <AuthorCard
            locale={locale}
            share={{
              title: post.title,
              url: `${siteConfig.url}/blog/${post.slug}`,
            }}
          />
          <RelatedPosts posts={relatedPosts} locale={locale} />
        </article>

        <PostToc items={toc} locale={locale} />
      </div>
    </>
  );
}

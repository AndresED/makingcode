import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostContent } from '@/components/post-content';
import { categoryLabel } from '@/lib/i18n/category';
import { getLocale } from '@/lib/i18n/locale';
import {
  getPublishedPostBySlug,
  listPublishedSlugs,
} from '@/lib/posts/repository';
import { buildArticleJsonLd, buildPostMetadata } from '@/lib/seo/post-metadata';

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
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: 'Not found' };
  return buildPostMetadata(post);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const locale = await getLocale();
  const jsonLd = buildArticleJsonLd(post);

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-8 space-y-4 border-b border-white/8 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <Link
            href={`/categories/${post.category}`}
            className="rounded-full border border-white/10 px-2.5 py-0.5 text-meta-500 hover:text-ink"
          >
            {categoryLabel(locale, post.category)}
          </Link>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.reading_time_minutes} min read</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-lg text-ink-muted">{post.excerpt}</p>
      </header>
      <PostContent bodyHtml={post.body_html} bodyMd={post.body_md} />
    </article>
  );
}

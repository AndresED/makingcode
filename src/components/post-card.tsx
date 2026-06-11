import Link from 'next/link';
import { PostCoverImage } from '@/components/post-cover-image';
import type { PostSummary } from '@/lib/posts/types';
import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface PostCardProps {
  post: PostSummary;
  locale: Locale;
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function PostCard({ post, locale }: PostCardProps) {
  return (
    <article className="surface-card surface-card-hover group flex h-full flex-col overflow-hidden">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-dark-900"
        tabIndex={-1}
        aria-hidden={post.cover_image_url ? undefined : true}
      >
        {post.cover_image_url ? (
          <PostCoverImage
            src={post.cover_image_url}
            alt=""
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-dark-700 via-dark-800 to-accent-500/10"
            aria-hidden="true"
          />
        )}
      </Link>
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-meta-400">
            {categoryLabel(locale, post.category)}
          </span>
          <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {post.reading_time_minutes} {t(locale, 'article.minRead')}
          </span>
        </div>
        <h2 className="text-lg font-medium leading-snug text-ink transition-colors duration-150 ease-out group-hover:text-accent-400">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">
          {post.excerpt}
        </p>
        <span className="mt-4 text-sm text-meta-400 transition-colors duration-150 ease-out group-hover:text-ink">
          {t(locale, 'article.read')} →
        </span>
      </Link>
    </article>
  );
}

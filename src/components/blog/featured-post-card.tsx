import Link from 'next/link';
import { PostCoverFallback } from '@/components/post-cover-fallback';
import { PostCoverImage } from '@/components/post-cover-image';
import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import type { PostSummary } from '@/lib/posts/types';

interface FeaturedPostCardProps {
  post: PostSummary;
  locale: Locale;
}

export function FeaturedPostCard({ post, locale }: FeaturedPostCardProps) {
  return (
    <article className="surface-card surface-card-hover group overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/10] min-h-[12rem] overflow-hidden bg-dark-900 sm:aspect-auto sm:min-h-[18rem]">
          {post.cover_image_url ? (
            <PostCoverImage
              src={post.cover_image_url}
              alt=""
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          ) : (
            <PostCoverFallback
              category={post.category}
              title={post.title}
              locale={locale}
              variant="featured"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent sm:bg-gradient-to-r"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <p className="label-caps text-accent-400">{t(locale, 'home.featured')}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="rounded-full border border-accent-500/25 bg-accent-500/10 px-2.5 py-0.5 text-accent-400">
              {categoryLabel(locale, post.category)}
            </span>
            <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>
          </div>
          <h2 className="text-2xl leading-tight text-ink sm:text-3xl">{post.title}</h2>
          <p className="line-clamp-3 text-base leading-relaxed text-ink-body">{post.excerpt}</p>
          <span className="text-sm font-medium text-meta-400 group-hover:text-ink">
            {t(locale, 'article.read')} →
          </span>
        </div>
      </Link>
    </article>
  );
}

function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

import Link from 'next/link';
import type { PostSummary } from '@/lib/posts/types';
import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';

interface PostCardProps {
  post: PostSummary;
  locale: Locale;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

export function PostCard({ post, locale }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/8 bg-dark-800/50 transition-colors hover:border-white/15">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-meta-500">
            {categoryLabel(locale, post.category)}
          </span>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.reading_time_minutes} min</span>
        </div>
        <h2 className="text-lg font-semibold text-ink transition-colors group-hover:text-accent-500">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-body">
          {post.excerpt}
        </p>
        <span className="mt-4 text-sm text-meta-500 group-hover:text-ink">Read article →</span>
      </Link>
    </article>
  );
}

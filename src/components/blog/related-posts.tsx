import { PostCard } from '@/components/post-card';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import type { PostSummary } from '@/lib/posts/types';

interface RelatedPostsProps {
  posts: PostSummary[];
  locale: Locale;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 space-y-6 border-t border-white/[0.06] pt-12">
      <h2 className="font-display text-xl text-ink">{t(locale, 'article.related')}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}

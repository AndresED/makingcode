import type { PostSummary } from '@/lib/posts/types';
import type { Locale } from '@/lib/i18n/dictionary';
import { PostCard } from './post-card';

interface PostGridProps {
  posts: PostSummary[];
  locale: Locale;
}

export function PostGrid({ posts, locale }: PostGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}

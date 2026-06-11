import { BlogSidebar } from '@/components/blog/blog-sidebar';
import type { Locale } from '@/lib/i18n/dictionary';
import type { PostSummary } from '@/lib/posts/types';

interface ListLayoutProps {
  locale: Locale;
  children: React.ReactNode;
  recentPosts?: PostSummary[];
  activeCategory?: string;
}

export function ListLayout({
  locale,
  children,
  recentPosts,
  activeCategory,
}: ListLayoutProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <BlogSidebar
          locale={locale}
          recentPosts={recentPosts}
          activeCategory={activeCategory}
        />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

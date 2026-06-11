import { BlogSearch } from '@/components/blog/blog-search';
import { CategoryNav } from '@/components/blog/category-nav';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import type { Locale } from '@/lib/i18n/dictionary';
import type { PostSummary } from '@/lib/posts/types';

interface ListLayoutProps {
  locale: Locale;
  children: React.ReactNode;
  recentPosts?: PostSummary[];
  activeCategory?: string;
  /** Show mobile-only search + category chips above main content */
  showMobileExplore?: boolean;
}

export function ListLayout({
  locale,
  children,
  recentPosts,
  activeCategory,
  showMobileExplore = false,
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
      <div className="min-w-0 space-y-6">
        {showMobileExplore ? (
          <div className="space-y-4 lg:hidden">
            <BlogSearch locale={locale} />
            <CategoryNav locale={locale} activeCategory={activeCategory} variant="chips" />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

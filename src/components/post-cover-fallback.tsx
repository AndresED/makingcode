import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';
import type { PostCategory } from '@/lib/posts/categories';
import { getCoverFallbackStyle } from '@/lib/posts/cover-fallback';

interface PostCoverFallbackProps {
  category: PostCategory;
  title: string;
  locale: Locale;
  /** compact = card thumbnail; featured = larger hero tile */
  variant?: 'card' | 'featured';
}

export function PostCoverFallback({
  category,
  title,
  locale,
  variant = 'card',
}: PostCoverFallbackProps) {
  const style = getCoverFallbackStyle(category, title);
  const isFeatured = variant === 'featured';

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${style.gradientFrom} ${style.gradientVia} ${style.gradientTo}`}
      aria-hidden="true"
    >
      <span
        className={`font-display font-medium ${style.accent} ${
          isFeatured ? 'text-6xl sm:text-7xl' : 'text-4xl'
        }`}
      >
        {style.glyph}
      </span>
      <span
        className={`mt-2 rounded-full border border-white/[0.08] bg-dark-950/30 px-2.5 py-0.5 font-sans uppercase tracking-wider text-ink-muted ${
          isFeatured ? 'text-[0.65rem]' : 'text-[0.6rem]'
        }`}
      >
        {categoryLabel(locale, category)}
      </span>
    </div>
  );
}

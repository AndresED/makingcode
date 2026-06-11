import Link from 'next/link';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface CategoryNavProps {
  locale: Locale;
  activeCategory?: string;
  variant?: 'sidebar' | 'chips';
}

export function CategoryNav({
  locale,
  activeCategory,
  variant = 'sidebar',
}: CategoryNavProps) {
  if (variant === 'chips') {
    return (
      <nav aria-label={t(locale, 'sidebar.categories')}>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {POST_CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <Link
                key={category}
                href={`/categories/${category}`}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ease-out ${
                  active
                    ? 'border-accent-500/40 bg-accent-500/15 text-accent-400'
                    : 'border-white/[0.08] bg-dark-800/50 text-ink-muted hover:border-white/[0.14] hover:text-ink'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {categoryLabel(locale, category)}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={t(locale, 'sidebar.categories')}>
      <p className="label-caps mb-3">{t(locale, 'sidebar.categories')}</p>
      <ul className="space-y-0.5">
        {POST_CATEGORIES.map((category) => {
          const active = activeCategory === category;
          return (
            <li key={category}>
              <Link
                href={`/categories/${category}`}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${
                    active ? 'bg-accent-400' : 'bg-accent-500/60'
                  }`}
                  aria-hidden="true"
                />
                {categoryLabel(locale, category)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

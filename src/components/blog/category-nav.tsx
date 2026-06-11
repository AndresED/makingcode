import Link from 'next/link';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { categoryLabel } from '@/lib/i18n/category';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface CategoryNavProps {
  locale: Locale;
  activeCategory?: string;
}

export function CategoryNav({ locale, activeCategory }: CategoryNavProps) {
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
                  className="size-1.5 shrink-0 rounded-full bg-accent-500/60"
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

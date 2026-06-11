import type { Metadata } from 'next';
import Link from 'next/link';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles on backend engineering, cloud, and software architecture.',
};

export default async function BlogPage() {
  const locale = await getLocale();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">{t(locale, 'nav.blog')}</h1>
        <p className="text-ink-muted">{t(locale, 'home.empty')}</p>
      </header>
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-muted">
          Categories
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POST_CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                href={`/categories/${category}`}
                className="inline-flex rounded-full border border-white/10 px-3 py-1 text-sm text-meta-500 transition-colors hover:border-white/20 hover:text-ink"
              >
                {t(locale, `category.${category}`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

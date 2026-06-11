import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPostCategory } from '@/lib/posts/categories';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isPostCategory(category)) {
    return { title: 'Not found' };
  }
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: label,
    description: `Articles in ${label} on Making Code.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (!isPostCategory(category)) {
    notFound();
  }

  const locale = await getLocale();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-ink">
        {t(locale, `category.${category}`)}
      </h1>
      <p className="text-ink-muted">{t(locale, 'home.empty')}</p>
    </section>
  );
}

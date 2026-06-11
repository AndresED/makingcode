import type { Metadata } from 'next';
import Link from 'next/link';
import { ListLayout } from '@/components/layout/list-layout';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { listPublishedPosts } from '@/lib/posts/repository';
import { siteConfig } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name} and ${siteConfig.author.name}.`,
};

export default async function AboutPage() {
  const locale = await getLocale();
  const { posts } = await listPublishedPosts({ page: 1, pageSize: 5 });
  const body1 = t(locale, 'about.body1').replace('{author}', siteConfig.author.name);

  return (
    <ListLayout locale={locale} recentPosts={posts}>
      <article className="max-w-2xl space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
            {t(locale, 'about.title')}
          </h1>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-ink-body">
          <p>
            <strong className="font-medium text-ink">{siteConfig.name}</strong> {body1}
          </p>
          <p className="text-ink-muted">{t(locale, 'about.body2')}</p>
        </div>

        <div className="surface-card flex flex-wrap items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-accent-500/15 text-lg font-bold text-accent-400">
            MC
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{siteConfig.author.name}</p>
            <p className="text-sm text-ink-muted">Senior Backend Engineer</p>
          </div>
          <div className="flex gap-3">
            <a
              href={siteConfig.author.url}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(locale, 'nav.portfolio')} ↗
            </a>
            <Link
              href="/blog"
              className="rounded-lg bg-accent-500/15 px-4 py-2 text-sm text-accent-400 transition-colors duration-150 ease-out hover:bg-accent-500/25"
            >
              {t(locale, 'nav.blog')}
            </Link>
          </div>
        </div>
      </article>
    </ListLayout>
  );
}

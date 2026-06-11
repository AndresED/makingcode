import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthorAvatar } from '@/components/author-avatar';
import { NewsletterForm } from '@/components/blog/newsletter-form';
import { AuthorSocialLinks } from '@/components/author-social-links';
import { ListLayout } from '@/components/layout/list-layout';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { MIN_POSTS_FOR_SIDEBAR_RECENT } from '@/lib/posts/constants';
import { listPublishedPosts } from '@/lib/posts/repository';
import { siteConfig } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name} and ${siteConfig.author.name}.`,
};

export const revalidate = 86_400;

const STACK_ITEMS = [
  'NestJS',
  'TypeScript',
  'AWS',
  'PostgreSQL',
  'Kafka',
  'Docker',
  'Event-driven architecture',
] as const;

export default async function AboutPage() {
  const locale = await getLocale();
  const { posts, total } = await listPublishedPosts({ page: 1, pageSize: 5 });
  const { author } = siteConfig;

  return (
    <ListLayout
      locale={locale}
      recentPosts={posts}
      showRecent={total >= MIN_POSTS_FOR_SIDEBAR_RECENT}
    >
      <article className="max-w-2xl space-y-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <AuthorAvatar size="lg" priority />
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-medium text-ink sm:text-4xl">
              {author.name}
            </h1>
            <p className="text-meta-400">{author.role}</p>
            <p className="text-sm text-ink-muted">{t(locale, 'home.authorLocation')}</p>
          </div>
        </header>

        <div className="space-y-5 text-base leading-relaxed text-ink-body">
          <p>{t(locale, 'about.para1')}</p>
          <p>{t(locale, 'about.para2')}</p>
          <p>{t(locale, 'about.para3')}</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">{t(locale, 'about.stackTitle')}</h2>
          <ul className="flex flex-wrap gap-2">
            {STACK_ITEMS.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/[0.08] bg-dark-800/50 px-3 py-1 text-xs text-ink-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card space-y-3 p-5">
          <h2 className="font-display text-lg text-ink">{t(locale, 'about.nowTitle')}</h2>
          <p className="text-sm leading-relaxed text-ink-body">{t(locale, 'about.now')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-ink">{t(locale, 'about.blogTitle')}</h2>
          <p className="text-ink-body">{t(locale, 'about.body2')}</p>
          <Link
            href="/blog"
            className="inline-flex text-sm text-accent-400 transition-colors duration-150 ease-out hover:text-ink"
          >
            {t(locale, 'home.ctaBlog')} →
          </Link>
        </section>

        <section className="flex flex-wrap gap-3">
          <a
            href={author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500/90 px-5 py-2.5 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90"
          >
            {t(locale, 'about.hireCta')} ↗
          </a>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-dark-800/40 px-5 py-2.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
          >
            {t(locale, 'home.ctaBlog')} →
          </Link>
        </section>

        <NewsletterForm locale={locale} />
        <AuthorSocialLinks locale={locale} />
      </article>
    </ListLayout>
  );
}

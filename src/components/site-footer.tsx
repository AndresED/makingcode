import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { AuthorSocialLinks } from '@/components/author-social-links';
import { t, type Locale } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  return (
    <footer className="mt-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Logo size="lg" />
            <p className="max-w-xs text-sm text-ink-muted">{t(locale, 'home.subtitle')}</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="label-caps">{t(locale, 'sidebar.explore')}</p>
            <ul className="space-y-1.5 text-ink-muted">
              <li>
                <Link href="/blog" className="hover:text-ink">
                  {t(locale, 'nav.blog')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ink">
                  {t(locale, 'nav.about')}
                </Link>
              </li>
              <li>
                <a href="/api/feed" className="hover:text-ink">
                  {t(locale, 'sidebar.rss')}
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3 text-sm text-ink-muted sm:text-right lg:text-right">
            <AuthorSocialLinks locale={locale} className="justify-start sm:justify-end" />
            <p>
              {t(locale, 'footer.tagline')}{' '}
              <a href={siteConfig.author.url} className="text-ink hover:text-accent-400">
                {siteConfig.author.name}
              </a>
            </p>
            <p>
              © {new Date().getFullYear()} · {t(locale, 'footer.built')}{' '}
              <a
                href="https://nextjs.org"
                className="text-meta-400 hover:text-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Next.js
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

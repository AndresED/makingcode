import { t, type Locale } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  return (
    <footer className="mt-16 border-t border-white/6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-sm text-ink-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.author.name}
        </p>
        <p>
          {t(locale, 'footer.built')}{' '}
          <a
            href="https://nextjs.org"
            className="text-meta-500 hover:text-ink"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>
          {' · '}
          <a href={siteConfig.author.url} className="hover:text-ink">
            andresed.dev
          </a>
        </p>
      </div>
    </footer>
  );
}

import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface AuthorSocialLinksProps {
  locale: Locale;
  className?: string;
}

export function AuthorSocialLinks({ locale, className = '' }: AuthorSocialLinksProps) {
  const { author } = siteConfig;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label={t(locale, 'author.connect')}>
      {author.socials.map((social) => (
        <li key={social.id}>
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-white/[0.08] bg-dark-900/50 px-3 py-2 text-xs text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
          >
            {social.label[locale]}
          </a>
        </li>
      ))}
      <li>
        <a
          href={author.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-accent-500/25 bg-accent-500/10 px-3 py-2 text-xs text-accent-400 transition-colors duration-150 ease-out hover:bg-accent-500/20"
        >
          {t(locale, 'author.cv')}
        </a>
      </li>
    </ul>
  );
}

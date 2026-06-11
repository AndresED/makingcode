import { AuthorAvatar } from '@/components/author-avatar';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';

interface AuthorCardProps {
  locale: Locale;
}

export function AuthorCard({ locale }: AuthorCardProps) {
  const { author } = siteConfig;

  return (
    <aside
      className="surface-card mt-12 overflow-hidden"
      aria-label={t(locale, 'author.about')}
    >
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:gap-6">
        <AuthorAvatar size="md" />

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="label-caps text-accent-400">{t(locale, 'author.writtenBy')}</p>
            <h2 className="mt-1 font-display text-xl text-ink">
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-150 ease-out hover:text-accent-400"
              >
                {author.name}
              </a>
            </h2>
            <p className="text-sm text-meta-400">{author.role}</p>
          </div>

          <p className="text-sm leading-relaxed text-ink-body">{t(locale, 'author.bio')}</p>

          <ul className="flex flex-wrap gap-2" aria-label={t(locale, 'author.connect')}>
            {author.socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-dark-900/50 px-3 py-2 text-xs text-ink-muted transition-[color,border-color,background-color] duration-150 ease-out hover:border-white/[0.14] hover:bg-dark-800 hover:text-ink"
                >
                  <SocialIcon id={social.id} />
                  <span>{social.label[locale]}</span>
                  <span className="sr-only"> ({t(locale, 'author.opensNewTab')})</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={author.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-500/25 bg-accent-500/10 px-3 py-2 text-xs text-accent-400 transition-colors duration-150 ease-out hover:bg-accent-500/20"
              >
                <CvIcon />
                {t(locale, 'author.cv')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

function SocialIcon({ id }: { id: string }) {
  switch (id) {
    case 'github':
      return <GithubIcon />;
    case 'linkedin':
      return <LinkedinIcon />;
    case 'medium':
      return <MediumIcon />;
    default:
      return <GlobeIcon />;
  }
}

function GlobeIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 10h15M10 2.5c2 2.5 2 12.5 0 15M10 2.5c-2 2.5-2 12.5 0 15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 2a8 8 0 0 0-2.54 15.6c.4.08.55-.18.55-.39v-1.38c-2.24.49-2.71-1.08-2.71-1.08-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.81.06 1.24.84 1.24.84.72 1.24 1.89.88 2.35.67.07-.53.28-.88.51-1.08-1.79-.2-3.67-.9-3.67-3.99 0-.88.31-1.6.84-2.16-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.53.56.84 1.28.84 2.16 0 3.1-1.89 3.79-3.69 3.98.29.25.55.74.55 1.5v2.22c0 .21.15.47.56.39A8 8 0 0 0 10 2Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M5.5 7.5h2.5v8H5.5v-8ZM6.75 4.5a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9ZM12 11.05c0-1.28-.69-1.88-1.6-1.88-.93 0-1.35.52-1.58 1.88v4.45H6.5V7.5h2.32v1.02h.03c.32-.6 1.1-1.24 2.27-1.24 2.4 0 2.84 1.58 2.84 3.64V15.5H12v-4.45Z" />
    </svg>
  );
}

function MediumIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M11.14 10.5 16.8 5.9c.12-.1.03-.36-.14-.36H14.2L10.2 9.2 7.1 5.54H3.5c-.17 0-.26.2-.14.31L8.1 10.5 3.36 15.7c-.12.1-.03.36.14.36h2.46l4.28-4.04 3.36 4.04h3.6c.17 0 .26-.2.14-.31l-4.8-5.19Z" />
    </svg>
  );
}

function CvIcon() {
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h5.2L15.5 7.3V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11 3.5V8h4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

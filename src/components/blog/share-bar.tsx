'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface ShareBarProps {
  title: string;
  locale: Locale;
  /** Canonical article URL — must be passed from the server to avoid hydration mismatch. */
  url: string;
}

export function ShareBar({ title, locale, url }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-6">
      <span className="label-caps mr-1">{t(locale, 'article.share')}</span>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
      >
        {copied ? t(locale, 'article.copied') : t(locale, 'article.copyLink')}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
      >
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:border-white/[0.14] hover:text-ink"
      >
        X
      </a>
    </div>
  );
}

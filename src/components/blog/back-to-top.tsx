'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';

interface BackToTopProps {
  locale: Locale;
}

export function BackToTop({ locale }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * 0.4;
      setVisible(window.scrollY > threshold);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 z-40 flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-dark-800/90 text-ink-muted shadow-lg backdrop-blur-sm transition-[color,background-color,border-color,opacity] duration-150 ease-out hover:border-white/[0.16] hover:bg-dark-700 hover:text-ink sm:right-6"
      aria-label={t(locale, 'article.backToTop')}
    >
      <ArrowUpIcon />
    </button>
  );
}

function ArrowUpIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4v12M6 8l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

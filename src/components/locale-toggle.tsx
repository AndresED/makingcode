'use client';

import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n/dictionary';
import { LOCALE_COOKIE } from '@/lib/i18n/constants';

interface LocaleToggleProps {
  locale: Locale;
}

export function LocaleToggle({ locale }: LocaleToggleProps) {
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    document.documentElement.lang = next;
    router.refresh();
  }

  return (
    <div
      className="flex rounded-md border border-white/10 p-0.5 text-xs"
      role="group"
      aria-label="Language"
    >
      {(['en', 'es'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded px-2 py-1 uppercase transition-colors ${
            locale === code
              ? 'bg-dark-700 text-ink'
              : 'text-ink-muted hover:text-ink'
          }`}
          aria-pressed={locale === code}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

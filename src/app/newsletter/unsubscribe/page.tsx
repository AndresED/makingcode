import type { Metadata } from 'next';
import Link from 'next/link';
import { t } from '@/lib/i18n/dictionary';
import { getLocale } from '@/lib/i18n/locale';
import { isValidUnsubscribeToken, unsubscribeByToken } from '@/lib/newsletter/unsubscribe';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterUnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const locale = await getLocale();
  const { token } = await searchParams;

  let result: 'ok' | 'already' | 'invalid' = 'invalid';
  if (isValidUnsubscribeToken(token)) {
    result = await unsubscribeByToken(token);
  }

  const messageKey =
    result === 'ok'
      ? 'newsletter.unsubscribeSuccess'
      : result === 'already'
        ? 'newsletter.unsubscribeAlready'
        : 'newsletter.unsubscribeInvalid';

  return (
    <section className="mx-auto max-w-lg space-y-6 text-center">
      <div className="surface-card space-y-4 px-6 py-10 sm:px-10">
        <h1 className="font-display text-2xl text-ink">{t(locale, 'newsletter.unsubscribeTitle')}</h1>
        <p className="text-base leading-relaxed text-ink-body">{t(locale, messageKey)}</p>
        <Link
          href="/"
          className="inline-flex text-sm text-accent-400 transition-colors duration-150 ease-out hover:text-ink"
        >
          ← {t(locale, 'nav.home')}
        </Link>
      </div>
    </section>
  );
}

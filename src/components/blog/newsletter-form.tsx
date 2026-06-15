'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/dictionary';
import { t } from '@/lib/i18n/dictionary';
import { sendNewsletterWelcomeEmail } from '@/lib/emailjs/newsletter';

interface NewsletterFormProps {
  locale: Locale;
  variant?: 'inline' | 'card' | 'sidebar';
}

type FormStatus = 'idle' | 'loading' | 'success' | 'already' | 'error';

export function NewsletterForm({ locale, variant = 'card' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const form = event.currentTarget;
      const website = new FormData(form).get('website');
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, website }),
      });

      if (!response.ok) {
        setStatus('error');
        return;
      }

      const data = (await response.json()) as {
        status?: string;
        unsubscribe_token?: string;
      };
      const isNew = data.status !== 'already_subscribed';
      const subscribedEmail = email.trim();
      setStatus(isNew ? 'success' : 'already');
      setEmail('');

      if (isNew && data.unsubscribe_token) {
        await sendNewsletterWelcomeEmail(
          subscribedEmail,
          locale,
          data.unsubscribe_token,
        ).catch(() => undefined);
      }
    } catch {
      setStatus('error');
    }
  }

  const wrapperClass =
    variant === 'card'
      ? 'surface-card space-y-4 p-6'
      : variant === 'sidebar'
        ? 'space-y-3 rounded-xl border border-white/[0.08] bg-dark-800/30 p-4'
        : 'space-y-4 border-t border-white/[0.06] pt-8';

  const titleClass =
    variant === 'sidebar' ? 'font-display text-base text-ink' : 'font-display text-xl text-ink';

  const bodyClass =
    variant === 'sidebar'
      ? 'text-xs leading-relaxed text-ink-muted'
      : 'text-sm leading-relaxed text-ink-body';

  const formClass =
    variant === 'sidebar' ? 'flex flex-col gap-2.5' : 'flex flex-col gap-3 sm:flex-row';

  return (
    <section className={wrapperClass} aria-label={t(locale, 'newsletter.title')}>
      <div className="space-y-1.5">
        <h2 className={titleClass}>{t(locale, 'newsletter.title')}</h2>
        <p className={bodyClass}>{t(locale, 'newsletter.body')}</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className={formClass}>
        <label className="sr-only" htmlFor={`newsletter-email-${variant}`}>
          {t(locale, 'newsletter.emailLabel')}
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(locale, 'newsletter.placeholder')}
          disabled={status === 'loading' || status === 'success'}
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-dark-900/80 px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-white/[0.16] focus:outline-none disabled:opacity-60"
        />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="shrink-0 rounded-xl bg-accent-500/90 px-5 py-2.5 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90 disabled:opacity-60"
        >
          {status === 'loading' ? t(locale, 'newsletter.submitting') : t(locale, 'newsletter.submit')}
        </button>
      </form>

      {status === 'success' ? (
        <p className="text-sm text-meta-400" role="status">
          {t(locale, 'newsletter.success')}
        </p>
      ) : null}
      {status === 'already' ? (
        <p className="text-sm text-meta-400" role="status">
          {t(locale, 'newsletter.already')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p className="text-sm text-red-400/90" role="alert">
          {t(locale, 'newsletter.error')}
        </p>
      ) : null}

      <p className="text-xs text-ink-muted">{t(locale, 'newsletter.privacy')}</p>
    </section>
  );
}

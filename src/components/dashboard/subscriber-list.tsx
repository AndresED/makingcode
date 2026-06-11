'use client';

import { useTransition } from 'react';
import { removeNewsletterSubscriberAction } from '@/lib/newsletter/actions';
import type { NewsletterSubscriber } from '@/lib/newsletter/repository';

interface SubscriberListProps {
  subscribers: NewsletterSubscriber[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function SubscriberList({ subscribers }: SubscriberListProps) {
  const [isPending, startTransition] = useTransition();

  if (subscribers.length === 0) {
    return (
      <div className="surface-card px-6 py-10 text-center">
        <p className="text-ink-muted">No subscribers yet.</p>
      </div>
    );
  }

  function handleRemove(subscriberId: string) {
    if (!window.confirm('Remove this subscriber from the newsletter?')) return;

    startTransition(async () => {
      const result = await removeNewsletterSubscriberAction(subscriberId);
      if (result.error) {
        window.alert(result.error);
      }
    });
  }

  return (
    <ul className="surface-card divide-y divide-white/[0.06] overflow-hidden">
      {subscribers.map((subscriber) => (
        <li
          key={subscriber.id}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-ink">{subscriber.email}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {formatDate(subscriber.subscribed_at)} · {subscriber.locale.toUpperCase()}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-meta-400">
              {subscriber.status}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(subscriber.id)}
              disabled={isPending}
              className="rounded-lg border border-red-500/25 px-3 py-1.5 text-xs text-red-300/90 transition-colors duration-150 ease-out hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

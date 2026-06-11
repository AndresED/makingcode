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
  if (subscribers.length === 0) {
    return (
      <div className="surface-card px-6 py-10 text-center">
        <p className="text-ink-muted">No subscribers yet.</p>
      </div>
    );
  }

  return (
    <ul className="surface-card divide-y divide-white/[0.06] overflow-hidden">
      {subscribers.map((subscriber) => (
        <li
          key={subscriber.id}
          className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium text-ink">{subscriber.email}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {formatDate(subscriber.subscribed_at)} · {subscriber.locale.toUpperCase()}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-meta-400">
            {subscriber.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

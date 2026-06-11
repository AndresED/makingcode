import type { Metadata } from 'next';
import { SubscriberList } from '@/components/dashboard/subscriber-list';
import {
  listNewsletterSubscribers,
  markNewsletterSubscribersSeen,
} from '@/lib/newsletter/repository';

export const metadata: Metadata = {
  title: 'Newsletter',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewsletterDashboardPage() {
  await markNewsletterSubscribersSeen();
  const subscribers = await listNewsletterSubscribers();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Newsletter</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {subscribers.length} active {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
        </p>
      </div>

      <SubscriberList subscribers={subscribers} />
    </section>
  );
}

import { createClient } from '@/lib/supabase/server';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  locale: string;
  status: string;
  subscribed_at: string;
  admin_seen_at: string | null;
}

export async function countUnreadNewsletterSubscribers(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('admin_seen_at', null);

  if (error) {
    if (error.message.includes('admin_seen_at')) return 0;
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, locale, status, subscribed_at, admin_seen_at')
    .eq('status', 'active')
    .order('subscribed_at', { ascending: false });

  if (error) {
    if (error.message.includes('newsletter_subscribers')) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as NewsletterSubscriber[];
}

export async function markNewsletterSubscribersSeen(): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ admin_seen_at: now })
    .eq('status', 'active')
    .is('admin_seen_at', null);

  if (error && !error.message.includes('admin_seen_at')) {
    throw new Error(error.message);
  }
}

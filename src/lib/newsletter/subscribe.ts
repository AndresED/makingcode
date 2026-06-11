import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/service';
import { createNewsletterUnsubscribeToken } from './token';

const subscribeSchema = z.object({
  email: z.string().trim().email().max(320),
  locale: z.enum(['en', 'es']).default('en'),
  website: z.string().optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

export type SubscribeResult =
  | { ok: true; status: 'subscribed' | 'already_subscribed'; unsubscribe_token?: string }
  | { ok: false; error: string };

export async function subscribeToNewsletter(input: unknown): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_email' };
  }

  if (parsed.data.website?.trim()) {
    return { ok: true, status: 'subscribed' };
  }

  const email = parsed.data.email.toLowerCase();
  const supabase = createServiceClient();

  const { data: existing, error: selectError } = await supabase
    .from('newsletter_subscribers')
    .select('id, status, unsubscribe_token')
    .eq('email', email)
    .maybeSingle();

  if (selectError) {
    if (selectError.message.includes('newsletter_subscribers')) {
      return { ok: false, error: 'not_configured' };
    }
    return { ok: false, error: 'server_error' };
  }

  if (existing?.status === 'active') {
    return { ok: true, status: 'already_subscribed' };
  }

  if (existing) {
    const token = existing.unsubscribe_token ?? createNewsletterUnsubscribeToken();
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        locale: parsed.data.locale,
        admin_seen_at: null,
        unsubscribe_token: token,
      })
      .eq('id', existing.id);

    if (updateError) return { ok: false, error: 'server_error' };
    return { ok: true, status: 'subscribed', unsubscribe_token: token };
  }

  const token = createNewsletterUnsubscribeToken();
  const { error: insertError } = await supabase.from('newsletter_subscribers').insert({
    email,
    locale: parsed.data.locale,
    status: 'active',
    unsubscribe_token: token,
  });

  if (insertError) return { ok: false, error: 'server_error' };

  return { ok: true, status: 'subscribed', unsubscribe_token: token };
}

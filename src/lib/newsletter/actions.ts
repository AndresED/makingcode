'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export async function removeNewsletterSubscriberAction(
  subscriberId: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', subscriberId)
    .eq('status', 'active');

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/newsletter');
  return {};
}

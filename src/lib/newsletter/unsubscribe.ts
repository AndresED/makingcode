import { createServiceClient } from '@/lib/supabase/service';

export type UnsubscribeResult = 'ok' | 'already' | 'invalid';

const TOKEN_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUnsubscribeToken(token: string | undefined): token is string {
  return typeof token === 'string' && TOKEN_PATTERN.test(token.trim());
}

export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const normalized = token.trim();
  if (!isValidUnsubscribeToken(normalized)) {
    return 'invalid';
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('unsubscribe_token', normalized)
    .maybeSingle();

  if (error) {
    if (error.message.includes('unsubscribe_token')) return 'invalid';
    throw new Error(error.message);
  }

  if (!data) return 'invalid';
  if (data.status === 'unsubscribed') return 'already';

  const { error: updateError } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', data.id);

  if (updateError) throw new Error(updateError.message);
  return 'ok';
}

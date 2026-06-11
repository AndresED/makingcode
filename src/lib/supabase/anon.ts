import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';

/** Read-only client for public queries (build + RSC without cookies). */
export function createAnonClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabasePublishableKey());
}

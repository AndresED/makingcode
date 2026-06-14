import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabasePublishableKey, getSupabaseUrl } from './env';
import { supabaseServerFetch } from './server-fetch';

const serverClientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: supabaseServerFetch },
} as const;

let anonClient: ReturnType<typeof createClient<Database>> | null = null;

/** Read-only client for public queries (build + RSC without cookies). */
export function createAnonClient() {
  if (!anonClient) {
    anonClient = createClient<Database>(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      serverClientOptions,
    );
  }
  return anonClient;
}

import { createClient } from '@supabase/supabase-js';
import { getServiceRoleKey, getSupabaseUrl } from './env';
import { supabaseServerFetch } from './server-fetch';

export function createServiceClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: supabaseServerFetch },
  });
}

import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getUserSafe, requestHasAuthCookies } from '@/lib/supabase/auth-helpers';
import type { User } from '@supabase/supabase-js';

export interface AdminSession {
  user: User;
  role: 'admin';
}

async function getSessionUserUncached(): Promise<User | null> {
  const cookieStore = await cookies();
  if (!requestHasAuthCookies(cookieStore.getAll())) {
    return null;
  }

  const supabase = await createClient();
  return getUserSafe(supabase);
}

export const getSessionUser = cache(getSessionUserUncached);

async function getAdminSessionUncached(): Promise<AdminSession | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return null;
  return { user, role: 'admin' };
}

export const getAdminSession = cache(getAdminSessionUncached);

/** Fast path for header: skip Supabase round-trips when no session cookies. */
export async function hasAuthSessionCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return requestHasAuthCookies(cookieStore.getAll());
}

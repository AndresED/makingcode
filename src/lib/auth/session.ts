import { createClient } from '@/lib/supabase/server';
import { getUserSafe, requestHasAuthCookies } from '@/lib/supabase/auth-helpers';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export interface AdminSession {
  user: User;
  role: 'admin';
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  if (!requestHasAuthCookies(cookieStore.getAll())) {
    return null;
  }

  const supabase = await createClient();
  return getUserSafe(supabase);
}

export async function getAdminSession(): Promise<AdminSession | null> {
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

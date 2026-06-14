import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';

function isStaleSessionError(error: AuthError): boolean {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? '';

  return (
    code === 'refresh_token_not_found' ||
    code === 'invalid_refresh_token' ||
    message.includes('refresh token') ||
    message.includes('invalid jwt') ||
    message.includes('jwt expired')
  );
}

/** Returns user or null — never throws; clears broken sessions when possible. */
export async function getUserSafe(supabase: SupabaseClient): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();

  if (!error) {
    return data.user;
  }

  if (isStaleSessionError(error)) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Cookie writes may fail in Server Components; middleware also clears sessions.
    }
  }

  return null;
}

export function requestHasAuthCookies(
  cookies: ReadonlyArray<{ name: string; value: string }>,
): boolean {
  return cookies.some((cookie) => cookie.name.includes('-auth-token'));
}

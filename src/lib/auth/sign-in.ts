interface SignInResult {
  ok: boolean;
  error?: string;
}

/** Login via server route — uses runtime env, not client bundle keys. */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin',
  });

  const body = (await res.json()) as { error?: string; ok?: boolean };

  if (!res.ok) {
    return { ok: false, error: body.error ?? 'Invalid email or password' };
  }

  return { ok: true };
}

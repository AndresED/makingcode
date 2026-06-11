'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword } from '@/lib/auth/sign-in';

function normalizeEmail(raw: string): string {
  return raw.normalize('NFKC').trim().toLowerCase().replace(/\u200b/g, '');
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = normalizeEmail(String(form.get('email') ?? ''));
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      setError('Email and password are required');
      setPending(false);
      return;
    }

    const signIn = await signInWithPassword(email, password);
    if (!signIn.ok) {
      setError(signIn.error ?? 'Invalid email or password');
      setPending(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          required
          className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink outline-none focus:border-meta-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-ink-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink outline-none focus:border-meta-500"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

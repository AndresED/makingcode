'use client';

import { useActionState } from 'react';
import { signInAction } from '@/lib/auth/actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
          minLength={12}
          className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink outline-none focus:border-meta-500"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
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

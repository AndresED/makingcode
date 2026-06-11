import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { getAdminSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/dashboard');

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-ink">Admin login</h1>
        <p className="text-sm text-ink-muted">Making Code dashboard</p>
      </div>
      <LoginForm />
    </section>
  );
}

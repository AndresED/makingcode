import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Admin login</h1>
      <p className="text-sm text-ink-muted">
        Email + password auth lands in Phase 3. Supabase project and migration should be
        ready first — see <code className="text-meta-500">supabase/README.md</code>.
      </p>
    </section>
  );
}

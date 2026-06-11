import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="text-ink-muted">
        Post editor and publish flow — Phase 3. Database schema is defined in{' '}
        <code className="text-meta-500">supabase/migrations/</code>.
      </p>
    </section>
  );
}

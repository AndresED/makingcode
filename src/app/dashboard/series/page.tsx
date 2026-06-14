import type { Metadata } from 'next';
import { SeriesList } from '@/components/dashboard/series-list';
import {
  countPostsWithoutSeriesAdmin,
  listAdminSeriesSummaries,
} from '@/lib/posts/series-admin';

export const metadata: Metadata = {
  title: 'Series',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DashboardSeriesPage() {
  const [series, unassignedCount] = await Promise.all([
    listAdminSeriesSummaries(),
    countPostsWithoutSeriesAdmin(),
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl text-ink">Series</h1>
        <p className="text-sm text-ink-muted">
          Group posts into ordered series. Public index at{' '}
          <code className="text-meta-400">/series/[slug]</code>.
        </p>
      </div>

      <SeriesList series={series} unassignedCount={unassignedCount} />
    </section>
  );
}

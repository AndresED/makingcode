import type { Metadata } from 'next';
import { AnalyticsReport } from '@/components/dashboard/analytics-report';
import { enrichTopPagesWithPostTitles } from '@/lib/analytics/enrich-pages';
import { getAnalyticsDashboardReport } from '@/lib/analytics/plausible-stats';
import { listAllPostsForAdmin } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

export const revalidate = 600;

export default async function DashboardAnalyticsPage() {
  const [report, posts] = await Promise.all([
    getAnalyticsDashboardReport(),
    listAllPostsForAdmin(),
  ]);

  const enrichedReport =
    report.topPages.length > 0
      ? {
          ...report,
          topPages: enrichTopPagesWithPostTitles(report.topPages, posts),
        }
      : report;

  return <AnalyticsReport report={enrichedReport} />;
}

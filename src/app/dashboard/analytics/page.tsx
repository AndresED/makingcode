import type { Metadata } from 'next';
import { AnalyticsReport } from '@/components/dashboard/analytics-report';
import { TopPublicationsPanel } from '@/components/dashboard/top-publications-panel';
import { enrichTopPagesWithPostTitles } from '@/lib/analytics/enrich-pages';
import { getAnalyticsDashboardReport } from '@/lib/analytics/first-party-stats';
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

  return (
    <div className="space-y-8">
      <TopPublicationsPanel posts={posts} />
      <AnalyticsReport report={enrichedReport} />
    </div>
  );
}

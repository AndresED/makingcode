import type { Metadata } from 'next';
import { AnalyticsReport } from '@/components/dashboard/analytics-report';
import { TopPublicationsPanel } from '@/components/dashboard/top-publications-panel';
import { analyticsQueryToSearchParams, parseAnalyticsQuery } from '@/lib/analytics/date-range';
import { enrichTopPagesWithPostTitles } from '@/lib/analytics/enrich-pages';
import { getAnalyticsDashboardReport } from '@/lib/analytics/first-party-stats';
import { listAllPostsForAdmin } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

export const revalidate = 600;

interface DashboardAnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardAnalyticsPage({ searchParams }: DashboardAnalyticsPageProps) {
  const params = await searchParams;
  const query = parseAnalyticsQuery(params);
  const paginationParams = analyticsQueryToSearchParams(query);

  const [report, posts] = await Promise.all([
    getAnalyticsDashboardReport(query),
    listAllPostsForAdmin(),
  ]);

  const enrichedReport =
    report.topPages.totalItems > 0
      ? {
          ...report,
          topPages: {
            ...report.topPages,
            rows: enrichTopPagesWithPostTitles(report.topPages.rows, posts),
          },
        }
      : report;

  return (
    <div className="space-y-8">
      <TopPublicationsPanel posts={posts} />
      <AnalyticsReport report={enrichedReport} paginationParams={paginationParams} />
    </div>
  );
}

export interface AnalyticsSummary {
  pageviews: number;
  visitors: number;
  visits: number;
}

export interface AnalyticsBreakdownRow {
  label: string;
  pageviews: number;
  visitors: number;
}

export interface AnalyticsPageRow extends AnalyticsBreakdownRow {
  path: string;
}

export interface AnalyticsDashboardReport {
  configured: boolean;
  provider: 'first-party';
  siteId: string | null;
  period7d: AnalyticsSummary | null;
  period30d: AnalyticsSummary | null;
  topPages: AnalyticsPageRow[];
  topSources: AnalyticsBreakdownRow[];
  topCountries: AnalyticsBreakdownRow[];
  fetchedAt: string;
  error?: string;
}

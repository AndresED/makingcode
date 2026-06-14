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

export interface PaginatedTable<T> {
  rows: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface AnalyticsDateRangeInfo {
  since: string;
  until: string | null;
  label: string;
  preset: '7d' | '30d' | '90d' | 'custom' | 'day';
}

export interface AnalyticsDashboardReport {
  configured: boolean;
  provider: 'first-party';
  siteId: string | null;
  period7d: AnalyticsSummary | null;
  period30d: AnalyticsSummary | null;
  rangeSummary: AnalyticsSummary | null;
  range: AnalyticsDateRangeInfo;
  topPages: PaginatedTable<AnalyticsPageRow>;
  topSources: PaginatedTable<AnalyticsBreakdownRow>;
  topCountries: PaginatedTable<AnalyticsBreakdownRow>;
  fetchedAt: string;
  error?: string;
}

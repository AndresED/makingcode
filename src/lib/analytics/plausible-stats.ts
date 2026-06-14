import { cache } from 'react';
import type {
  AnalyticsBreakdownRow,
  AnalyticsDashboardReport,
  AnalyticsPageRow,
  AnalyticsSummary,
} from './types';

const DEFAULT_API_BASE = 'https://plausible.io';

interface PlausibleQueryBody {
  site_id: string;
  metrics: string[];
  date_range: string;
  dimensions?: string[];
  filters?: unknown[];
  order_by?: [string, string][];
  pagination?: { limit: number; offset: number };
}

interface PlausibleQueryResponse {
  results: Array<{
    metrics: Array<number | null>;
    dimensions: string[];
  }>;
  meta?: Record<string, unknown>;
}

function getPlausibleCredentials(): { apiKey: string; siteId: string } | null {
  const apiKey = process.env.PLAUSIBLE_API_KEY?.trim();
  const siteId =
    process.env.PLAUSIBLE_SITE_ID?.trim() ??
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

  if (!apiKey || !siteId) return null;
  return { apiKey, siteId };
}

function apiBase(): string {
  return process.env.PLAUSIBLE_API_BASE?.trim().replace(/\/$/, '') ?? DEFAULT_API_BASE;
}

async function queryPlausible(body: Omit<PlausibleQueryBody, 'site_id'>): Promise<PlausibleQueryResponse | null> {
  const credentials = getPlausibleCredentials();
  if (!credentials) return null;

  const response = await fetch(`${apiBase()}/api/v2/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      site_id: credentials.siteId,
    }),
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Plausible API ${response.status}: ${detail.slice(0, 200)}`);
  }

  return (await response.json()) as PlausibleQueryResponse;
}

function toSummary(results: PlausibleQueryResponse['results']): AnalyticsSummary {
  const metrics = results[0]?.metrics ?? [];
  return {
    visitors: Number(metrics[0] ?? 0),
    pageviews: Number(metrics[1] ?? 0),
    visits: Number(metrics[2] ?? 0),
  };
}

function toBreakdownRows(
  results: PlausibleQueryResponse['results'],
  emptyLabel = '(not set)',
): AnalyticsBreakdownRow[] {
  return results
    .map((row) => ({
      label: row.dimensions[0]?.trim() || emptyLabel,
      visitors: Number(row.metrics[0] ?? 0),
      pageviews: Number(row.metrics[1] ?? 0),
    }))
    .filter((row) => row.pageviews > 0 || row.visitors > 0);
}

function toPageRows(results: PlausibleQueryResponse['results']): AnalyticsPageRow[] {
  return results
    .map((row) => ({
      path: row.dimensions[0] ?? '/',
      label: row.dimensions[0] ?? '/',
      visitors: Number(row.metrics[0] ?? 0),
      pageviews: Number(row.metrics[1] ?? 0),
    }))
    .filter((row) => row.pageviews > 0);
}

async function fetchSummary(dateRange: '7d' | '30d'): Promise<AnalyticsSummary | null> {
  const data = await queryPlausible({
    metrics: ['visitors', 'pageviews', 'visits'],
    date_range: dateRange,
  });
  if (!data) return null;
  return toSummary(data.results);
}

async function fetchTopPages(limit = 10): Promise<AnalyticsPageRow[]> {
  const data = await queryPlausible({
    metrics: ['visitors', 'pageviews'],
    date_range: '30d',
    dimensions: ['event:page'],
    order_by: [['pageviews', 'desc']],
    pagination: { limit, offset: 0 },
  });
  if (!data) return [];
  return toPageRows(data.results);
}

async function fetchTopSources(limit = 8): Promise<AnalyticsBreakdownRow[]> {
  const data = await queryPlausible({
    metrics: ['visitors', 'pageviews'],
    date_range: '30d',
    dimensions: ['visit:source'],
    filters: [['is_not', 'visit:source', ['']]],
    order_by: [['visitors', 'desc']],
    pagination: { limit, offset: 0 },
  });
  if (!data) return [];
  return toBreakdownRows(data.results);
}

async function fetchTopCountries(limit = 8): Promise<AnalyticsBreakdownRow[]> {
  const data = await queryPlausible({
    metrics: ['visitors', 'pageviews'],
    date_range: '30d',
    dimensions: ['visit:country_name'],
    filters: [['is_not', 'visit:country_name', ['']]],
    order_by: [['visitors', 'desc']],
    pagination: { limit, offset: 0 },
  });
  if (!data) return [];
  return toBreakdownRows(data.results);
}

export const getAnalyticsDashboardReport = cache(async (): Promise<AnalyticsDashboardReport> => {
  const credentials = getPlausibleCredentials();
  const fetchedAt = new Date().toISOString();

  if (!credentials) {
    return {
      configured: false,
      siteId: null,
      period7d: null,
      period30d: null,
      topPages: [],
      topSources: [],
      topCountries: [],
      fetchedAt,
    };
  }

  try {
    const [period7d, period30d, topPages, topSources, topCountries] = await Promise.all([
      fetchSummary('7d'),
      fetchSummary('30d'),
      fetchTopPages(12),
      fetchTopSources(8),
      fetchTopCountries(8),
    ]);

    return {
      configured: true,
      siteId: credentials.siteId,
      period7d,
      period30d,
      topPages,
      topSources,
      topCountries,
      fetchedAt,
    };
  } catch (error) {
    return {
      configured: true,
      siteId: credentials.siteId,
      period7d: null,
      period30d: null,
      topPages: [],
      topSources: [],
      topCountries: [],
      fetchedAt,
      error: error instanceof Error ? error.message : 'Failed to load analytics',
    };
  }
});

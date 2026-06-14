import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { siteConfig } from '@/lib/seo/site';
import type {
  AnalyticsBreakdownRow,
  AnalyticsDashboardReport,
  AnalyticsPageRow,
  AnalyticsSummary,
} from './types';

interface SummaryRow {
  pageviews: number;
  visitors: number;
  visits: number;
}

interface BreakdownRpcRow {
  path?: string;
  referrer_host?: string;
  country_code?: string;
  pageviews: number;
  visitors: number;
}

function sinceDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function isAnalyticsUnavailable(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('page_view_events') ||
    lower.includes('record_page_view') ||
    lower.includes('analytics_summary') ||
    lower.includes('does not exist')
  );
}

function toSummary(row: SummaryRow | null | undefined): AnalyticsSummary | null {
  if (!row) return null;
  return {
    pageviews: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
    visits: Number(row.visits ?? 0),
  };
}

async function fetchSummary(since: string): Promise<AnalyticsSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('analytics_summary', { p_since: since });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as SummaryRow | undefined;
  return toSummary(row);
}

async function fetchTopPages(since: string, limit: number): Promise<AnalyticsPageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('analytics_top_pages', {
    p_since: since,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as BreakdownRpcRow[]).map((row) => ({
    path: row.path ?? '/',
    label: row.path ?? '/',
    pageviews: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
  }));
}

async function fetchTopReferrers(since: string, limit: number): Promise<AnalyticsBreakdownRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('analytics_top_referrers', {
    p_since: since,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as BreakdownRpcRow[]).map((row) => ({
    label: row.referrer_host ?? '(direct)',
    pageviews: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
  }));
}

async function fetchTopCountries(since: string, limit: number): Promise<AnalyticsBreakdownRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('analytics_top_countries', {
    p_since: since,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as BreakdownRpcRow[]).map((row) => ({
    label: row.country_code ?? '—',
    pageviews: Number(row.pageviews ?? 0),
    visitors: Number(row.visitors ?? 0),
  }));
}

export const getAnalyticsDashboardReport = cache(async (): Promise<AnalyticsDashboardReport> => {
  const fetchedAt = new Date().toISOString();
  const since7d = sinceDays(7);
  const since30d = sinceDays(30);

  try {
    const [period7d, period30d, topPages, topSources, topCountries] = await Promise.all([
      fetchSummary(since7d),
      fetchSummary(since30d),
      fetchTopPages(since30d, 12),
      fetchTopReferrers(since30d, 8),
      fetchTopCountries(since30d, 8),
    ]);

    return {
      configured: true,
      provider: 'first-party',
      siteId: siteConfig.url,
      period7d,
      period30d,
      topPages,
      topSources,
      topCountries,
      fetchedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics';

    return {
      configured: !isAnalyticsUnavailable(message),
      provider: 'first-party',
      siteId: siteConfig.url,
      period7d: null,
      period30d: null,
      topPages: [],
      topSources: [],
      topCountries: [],
      fetchedAt,
      error: isAnalyticsUnavailable(message)
        ? 'Apply the page_view_events migration in Supabase (supabase db push).'
        : message,
    };
  }
});

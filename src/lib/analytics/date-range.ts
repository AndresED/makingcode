export type AnalyticsRangePreset = '7d' | '30d' | '90d';

export interface AnalyticsDateRange {
  since: string;
  until: string | null;
  label: string;
  preset: AnalyticsRangePreset | 'custom' | 'day';
}

export interface AnalyticsQueryState {
  range: AnalyticsDateRange;
  pagesPage: number;
  referrersPage: number;
  countriesPage: number;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const ANALYTICS_TABLE_PAGE_SIZE = 10;

function parseDateOnly(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function sinceDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${formatDateLabel(from)} – ${formatDateLabel(to)}`;
}

function clampPage(value: string | undefined): number {
  const page = Math.max(1, Number(value ?? '1') || 1);
  return Number.isFinite(page) ? page : 1;
}

export function parseAnalyticsQuery(
  params: Record<string, string | string[] | undefined>,
): AnalyticsQueryState {
  const dateParam = typeof params.date === 'string' ? params.date : undefined;
  const fromParam = typeof params.from === 'string' ? params.from : undefined;
  const toParam = typeof params.to === 'string' ? params.to : undefined;
  const rangeParam = typeof params.range === 'string' ? params.range : undefined;

  if (dateParam) {
    const day = parseDateOnly(dateParam);
    if (day) {
      const since = startOfUtcDay(day);
      const until = addUtcDays(since, 1);
      return {
        range: {
          since: since.toISOString(),
          until: until.toISOString(),
          label: formatDateLabel(day),
          preset: 'day',
        },
        pagesPage: clampPage(typeof params.pagesPage === 'string' ? params.pagesPage : undefined),
        referrersPage: clampPage(
          typeof params.referrersPage === 'string' ? params.referrersPage : undefined,
        ),
        countriesPage: clampPage(
          typeof params.countriesPage === 'string' ? params.countriesPage : undefined,
        ),
      };
    }
  }

  if (fromParam) {
    const from = parseDateOnly(fromParam);
    if (from) {
      const since = startOfUtcDay(from);
      const to = toParam ? parseDateOnly(toParam) : from;
      const until = to ? addUtcDays(startOfUtcDay(to), 1) : null;
      return {
        range: {
          since: since.toISOString(),
          until: until?.toISOString() ?? null,
          label: to ? formatRangeLabel(from, to) : formatDateLabel(from),
          preset: 'custom',
        },
        pagesPage: clampPage(typeof params.pagesPage === 'string' ? params.pagesPage : undefined),
        referrersPage: clampPage(
          typeof params.referrersPage === 'string' ? params.referrersPage : undefined,
        ),
        countriesPage: clampPage(
          typeof params.countriesPage === 'string' ? params.countriesPage : undefined,
        ),
      };
    }
  }

  const preset: AnalyticsRangePreset =
    rangeParam === '7d' || rangeParam === '90d' ? rangeParam : '30d';
  const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30;

  return {
    range: {
      since: sinceDays(days),
      until: null,
      label: `Last ${days} days`,
      preset,
    },
    pagesPage: clampPage(typeof params.pagesPage === 'string' ? params.pagesPage : undefined),
    referrersPage: clampPage(
      typeof params.referrersPage === 'string' ? params.referrersPage : undefined,
    ),
    countriesPage: clampPage(
      typeof params.countriesPage === 'string' ? params.countriesPage : undefined,
    ),
  };
}

export function analyticsQueryToSearchParams(query: AnalyticsQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.range.preset === 'day') {
    const day = query.range.since.slice(0, 10);
    params.set('date', day);
  } else if (query.range.preset === 'custom') {
    params.set('from', query.range.since.slice(0, 10));
    if (query.range.until) {
      const untilDay = addUtcDays(new Date(query.range.until), -1);
      params.set('to', untilDay.toISOString().slice(0, 10));
    }
  } else {
    params.set('range', query.range.preset);
  }

  if (query.pagesPage > 1) params.set('pagesPage', String(query.pagesPage));
  if (query.referrersPage > 1) params.set('referrersPage', String(query.referrersPage));
  if (query.countriesPage > 1) params.set('countriesPage', String(query.countriesPage));

  return params;
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize = ANALYTICS_TABLE_PAGE_SIZE,
): { rows: T[]; page: number; pageSize: number; totalPages: number; totalItems: number } {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
  };
}

import type { AnalyticsDashboardReport } from '@/lib/analytics/types';

interface AnalyticsReportProps {
  report: AnalyticsDashboardReport;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

function formatFetchedAt(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | null;
  hint?: string;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">
        {value == null ? '—' : formatNumber(value)}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  valueLabel,
  emptyLabel,
}: {
  title: string;
  rows: Array<{ label: string; pageviews: number; visitors: number; path?: string }>;
  valueLabel: string;
  emptyLabel: string;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h2 className="font-display text-lg text-ink">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium text-right">Visitors</th>
                <th className="px-5 py-3 font-medium text-right">{valueLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row) => (
                <tr key={`${title}-${row.label}`} className="hover:bg-white/[0.02]">
                  <td className="max-w-xs px-5 py-3 text-ink">
                    {row.path ? (
                      <div className="space-y-0.5">
                        <span className="line-clamp-2">{row.label}</span>
                        <code className="block truncate text-xs text-ink-muted">{row.path}</code>
                      </div>
                    ) : (
                      <span className="line-clamp-2">{row.label}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-body">{formatNumber(row.visitors)}</td>
                  <td className="px-5 py-3 text-right font-medium text-ink">
                    {formatNumber(row.pageviews)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SetupPanel({ message }: { message: string }) {
  return (
    <div className="surface-card space-y-4 px-6 py-8">
      <div>
        <h2 className="font-display text-xl text-ink">Analytics setup</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{message}</p>
      </div>
      <ul className="space-y-2 text-sm text-ink-body">
        <li>Run the Supabase migration: <code>supabase/migrations/20260622000000_page_view_events.sql</code></li>
        <li>Public pages send lightweight beacons to <code>/api/analytics/view</code></li>
        <li>No third-party service or paid trial required</li>
      </ul>
    </div>
  );
}

export function AnalyticsReport({ report }: AnalyticsReportProps) {
  if (!report.configured) {
    return (
      <SetupPanel message="First-party analytics is not ready yet. Apply the page_view_events migration in Supabase." />
    );
  }

  if (report.error) {
    return (
      <div className="space-y-4">
        <div className="surface-card border-rose-500/20 bg-rose-500/10 px-6 py-5">
          <p className="font-medium text-ink">Could not load analytics</p>
          <p className="mt-2 text-sm text-ink-muted">{report.error}</p>
        </div>
        <SetupPanel message="Fix the issue above, then redeploy. Tracking uses your Supabase database only." />
      </div>
    );
  }

  const hasData =
    (report.period30d?.pageviews ?? 0) > 0 ||
    report.topPages.length > 0 ||
    report.topSources.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">Analytics</h1>
          <p className="mt-1 text-sm text-ink-muted">
            First-party · stored in Supabase · updated {formatFetchedAt(report.fetchedAt)}
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="surface-card px-6 py-5 text-sm text-ink-muted">
          No views recorded yet. Browse a few public pages on the site and refresh this report.
          Dashboard and login routes are excluded from tracking.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Pageviews (7d)" value={report.period7d?.pageviews ?? null} />
        <SummaryCard label="Visitors (7d)" value={report.period7d?.visitors ?? null} />
        <SummaryCard
          label="Pageviews (30d)"
          value={report.period30d?.pageviews ?? null}
          hint="Top lists use 30 days"
        />
        <SummaryCard label="Visitors (30d)" value={report.period30d?.visitors ?? null} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownTable
          title="Top pages (30d)"
          rows={report.topPages}
          valueLabel="Views"
          emptyLabel="No page data yet."
        />
        <BreakdownTable
          title="Top referrers (30d)"
          rows={report.topSources}
          valueLabel="Views"
          emptyLabel="No referrer data yet."
        />
      </div>

      <BreakdownTable
        title="Top countries (30d)"
        rows={report.topCountries}
        valueLabel="Views"
        emptyLabel="No country data yet."
      />

      <p className="text-xs text-ink-muted">
        Visitors are estimated with a privacy-friendly session id in localStorage. Country comes
        from Vercel geo headers. Bots are filtered server-side.
      </p>
    </div>
  );
}

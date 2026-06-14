'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createSeriesRedirectAction } from '@/lib/posts/series-actions';
import type { AdminSeriesSummary } from '@/lib/posts/series-admin';
import { formatSeriesName } from '@/lib/posts/format-series-name';

interface SeriesListProps {
  series: AdminSeriesSummary[];
  unassignedCount: number;
}

export function SeriesList({ series, unassignedCount }: SeriesListProps) {
  const [state, formAction, pending] = useActionState(createSeriesRedirectAction, {});

  return (
    <div className="space-y-8">
      <form action={formAction} className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="series_slug" className="mb-1 block text-sm text-ink-muted">
            New or existing series slug
          </label>
          <input
            id="series_slug"
            name="series_slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="nestjs-enterprise"
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-muted"
          />
          <p className="mt-1 text-xs text-ink-muted">
            Kebab-case identifier. Creates the manager view; assign posts on the next screen.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-dark-950 transition-opacity duration-150 ease-out hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Opening…' : 'Manage series'}
        </button>
      </form>

      {state.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {unassignedCount > 0 ? (
        <p className="text-sm text-ink-muted">
          {unassignedCount} post{unassignedCount === 1 ? '' : 's'} not assigned to any series.
        </p>
      ) : null}

      {series.length === 0 ? (
        <div className="surface-card px-6 py-10 text-center">
          <p className="text-ink-muted">No series yet. Enter a slug above to start one.</p>
        </div>
      ) : (
        <ul className="surface-card divide-y divide-white/[0.06] overflow-hidden">
          {series.map((item) => (
            <li
              key={item.slug}
              className="flex flex-col gap-3 px-4 py-4 transition-colors duration-150 ease-out hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{formatSeriesName(item.slug)}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">{item.slug}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {item.postCount} post{item.postCount === 1 ? '' : 's'} · {item.publishedCount}{' '}
                  published
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/series/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
                >
                  View public →
                </Link>
                <Link
                  href={`/dashboard/series/${item.slug}`}
                  className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-white/[0.1]"
                >
                  Manage
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

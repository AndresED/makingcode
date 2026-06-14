'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { AnalyticsDateRangeInfo } from '@/lib/analytics/types';

interface AnalyticsDateFilterProps {
  range: AnalyticsDateRangeInfo;
}

const PRESETS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
] as const;

export function AnalyticsDateFilter({ range }: AnalyticsDateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(
    range.preset === 'custom' ? range.since.slice(0, 10) : '',
  );
  const [to, setTo] = useState(() => {
    if (range.preset !== 'custom' || !range.until) return '';
    const until = new Date(range.until);
    until.setUTCDate(until.getUTCDate() - 1);
    return until.toISOString().slice(0, 10);
  });
  const [day, setDay] = useState(range.preset === 'day' ? range.since.slice(0, 10) : '');

  function navigate(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `/dashboard/analytics?${query}` : '/dashboard/analytics');
  }

  function baseParams(): URLSearchParams {
    return new URLSearchParams(searchParams.toString());
  }

  function resetPagination(params: URLSearchParams) {
    params.delete('pagesPage');
    params.delete('referrersPage');
    params.delete('countriesPage');
  }

  function applyPreset(preset: '7d' | '30d' | '90d') {
    const params = baseParams();
    resetPagination(params);
    params.delete('date');
    params.delete('from');
    params.delete('to');
    params.set('range', preset);
    navigate(params);
  }

  function applyCustomRange(event: React.FormEvent) {
    event.preventDefault();
    if (!from) return;
    const params = baseParams();
    resetPagination(params);
    params.delete('range');
    params.delete('date');
    params.set('from', from);
    if (to) params.set('to', to);
    else params.delete('to');
    navigate(params);
  }

  function applySingleDay(event: React.FormEvent) {
    event.preventDefault();
    if (!day) return;
    const params = baseParams();
    resetPagination(params);
    params.delete('range');
    params.delete('from');
    params.delete('to');
    params.set('date', day);
    navigate(params);
  }

  return (
    <section className="surface-card space-y-5 p-5">
      <div>
        <h2 className="font-display text-lg text-ink">Date range</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tables use <span className="text-ink-body">{range.label}</span>. Summary cards stay at
          7d / 30d.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out ${
              range.preset === preset.id
                ? 'bg-white/[0.08] font-medium text-ink'
                : 'border border-white/[0.08] text-ink-muted hover:text-ink'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={applyCustomRange} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm">
          <span className="mb-1.5 block text-ink-muted">From</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-ink-muted">To</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Apply range
        </button>
      </form>

      <form onSubmit={applySingleDay} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="mb-1.5 block text-ink-muted">Specific day</span>
          <input
            type="date"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Apply day
        </button>
      </form>
    </section>
  );
}

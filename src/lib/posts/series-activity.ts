/** Series without a publish in this window are treated as complete on the home. */
export const SERIES_ACTIVE_WINDOW_DAYS = 90;

export type SeriesActivityStatus = 'active' | 'complete';

export function inferSeriesActivityStatus(
  lastPublishedAt: string | null,
  now = Date.now(),
): SeriesActivityStatus {
  if (!lastPublishedAt) return 'complete';

  const elapsed = now - new Date(lastPublishedAt).getTime();
  const windowMs = SERIES_ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return elapsed <= windowMs ? 'active' : 'complete';
}

export interface SeriesSortable {
  activityStatus: SeriesActivityStatus;
  lastPublishedAt: string | null;
}

export function compareSeriesForDisplay(a: SeriesSortable, b: SeriesSortable): number {
  if (a.activityStatus !== b.activityStatus) {
    return a.activityStatus === 'active' ? -1 : 1;
  }

  const aTime = a.lastPublishedAt ? new Date(a.lastPublishedAt).getTime() : 0;
  const bTime = b.lastPublishedAt ? new Date(b.lastPublishedAt).getTime() : 0;
  return bTime - aTime;
}

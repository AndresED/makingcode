import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SeriesManager } from '@/components/dashboard/series-manager';
import { formatSeriesName } from '@/lib/posts/format-series-name';
import {
  isValidSeriesSlug,
  listPostsAvailableForSeriesAdmin,
  listPostsInSeriesAdmin,
} from '@/lib/posts/series-admin';
import { getPostSeriesBySlug, upsertPostSeriesBySlug } from '@/lib/posts/series-repository';

export const metadata: Metadata = {
  title: 'Manage series',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface DashboardSeriesDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardSeriesDetailPage({
  params,
}: DashboardSeriesDetailPageProps) {
  const { slug } = await params;
  if (!isValidSeriesSlug(slug)) notFound();

  const series =
    (await getPostSeriesBySlug(slug)) ?? (await upsertPostSeriesBySlug(slug));

  const [postsInSeries, availablePosts] = await Promise.all([
    listPostsInSeriesAdmin(slug),
    listPostsAvailableForSeriesAdmin(slug),
  ]);

  const displayName = formatSeriesName(slug, 'en', {
    title_en: series.title_en,
    title_es: series.title_es,
  });
  const publicUrl = `/series/${slug}`;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/dashboard/series"
          className="inline-flex text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← All series
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-ink">{displayName}</h1>
            <p className="mt-1 font-mono text-sm text-ink-muted">{slug}</p>
          </div>
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            View public page →
          </Link>
        </div>
      </div>

      <SeriesManager
        seriesSlug={slug}
        seriesTitles={{ title_en: series.title_en, title_es: series.title_es }}
        postsInSeries={postsInSeries}
        availablePosts={availablePosts}
      />
    </section>
  );
}

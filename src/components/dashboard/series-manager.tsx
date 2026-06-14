'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  assignPostToSeriesAction,
  moveSeriesPostAction,
  removePostFromSeriesAction,
  renameSeriesSlugAction,
} from '@/lib/posts/series-actions';
import type { PostRecord } from '@/lib/posts/types';
import { formatSeriesName } from '@/lib/posts/format-series-name';

interface SeriesManagerProps {
  seriesSlug: string;
  postsInSeries: PostRecord[];
  availablePosts: PostRecord[];
}

export function SeriesManager({ seriesSlug, postsInSeries, availablePosts }: SeriesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState('');

  function run(action: () => Promise<{ error?: string }>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-lg text-ink">Articles in this series</h2>

        {postsInSeries.length === 0 ? (
          <p className="text-sm text-ink-muted">No posts assigned yet. Add one below.</p>
        ) : (
          <ol className="surface-card divide-y divide-white/[0.06] overflow-hidden">
            {postsInSeries.map((post, index) => (
              <li
                key={post.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 font-mono text-sm text-meta-400">
                    {String(post.series_order ?? index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="font-medium text-ink transition-colors hover:text-accent-400"
                    >
                      {post.title_en}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{post.title_es}</p>
                    <p className="font-mono text-xs text-ink-muted/80">/blog/{post.slug_en}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      post.status === 'published'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {post.status}
                  </span>
                  <button
                    type="button"
                    disabled={pending || index === 0}
                    onClick={() =>
                      run(() => moveSeriesPostAction(post.id, seriesSlug, 'up'))
                    }
                    className="rounded-lg border border-white/[0.08] px-2 py-1 text-xs text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={pending || index === postsInSeries.length - 1}
                    onClick={() =>
                      run(() => moveSeriesPostAction(post.id, seriesSlug, 'down'))
                    }
                    className="rounded-lg border border-white/[0.08] px-2 py-1 text-xs text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => removePostFromSeriesAction(post.id))}
                    className="rounded-lg border border-white/[0.08] px-2 py-1 text-xs text-ink-muted transition-colors hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="surface-card space-y-3 p-5">
        <h2 className="font-display text-lg text-ink">Add post to series</h2>
        {availablePosts.length === 0 ? (
          <p className="text-sm text-ink-muted">All posts are already in this series.</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="add-post" className="mb-1 block text-sm text-ink-muted">
                Select post
              </label>
              <select
                id="add-post"
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
              >
                <option value="">Choose a post…</option>
                {availablePosts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title_en}
                    {post.series_slug ? ` (from ${post.series_slug})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={pending || !selectedPostId}
              onClick={() =>
                run(
                  () => assignPostToSeriesAction(selectedPostId, seriesSlug),
                  () => setSelectedPostId(''),
                )
              }
              className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-dark-950 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Add to series
            </button>
          </div>
        )}
        <p className="text-xs text-ink-muted">
          Posts moved from another series are reassigned here. Order is appended at the end; use ↑↓
          to reorder.
        </p>
      </section>

      <RenameSeriesForm seriesSlug={seriesSlug} disabled={pending || postsInSeries.length === 0} />
    </div>
  );
}

function RenameSeriesForm({ seriesSlug, disabled }: { seriesSlug: string; disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newSlug, setNewSlug] = useState(seriesSlug);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="surface-card space-y-3 border border-white/[0.06] p-5">
      <h2 className="font-display text-lg text-ink">Rename series slug</h2>
      <p className="text-sm text-ink-muted">
        Updates all {formatSeriesName(seriesSlug)} posts and the public URL /series/…
      </p>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await renameSeriesSlugAction(seriesSlug, newSlug);
            if (result.error) {
              setError(result.error);
              return;
            }
            if (result.newSlug) {
              router.push(`/dashboard/series/${result.newSlug}`);
            }
          });
        }}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="rename-slug" className="mb-1 block text-sm text-ink-muted">
            New slug
          </label>
          <input
            id="rename-slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 font-mono text-sm text-ink"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || pending || newSlug.trim() === seriesSlug}
          className="shrink-0 rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          Rename
        </button>
      </form>
    </section>
  );
}

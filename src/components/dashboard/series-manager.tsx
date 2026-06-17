'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CoverImageUpload } from '@/components/blog/cover-image-upload';
import {
  assignPostToSeriesAction,
  moveSeriesPostAction,
  removePostFromSeriesAction,
  renameSeriesSlugAction,
  updateSeriesPresentationAction,
  updateSeriesTitlesAction,
} from '@/lib/posts/series-actions';
import type { PostRecord } from '@/lib/posts/types';
import { formatSeriesName } from '@/lib/posts/format-series-name';
import { seriesPresentationComplete } from '@/lib/posts/series-presentation';

interface SeriesPresentation {
  description_en: string;
  description_es: string;
  cover_image_url: string;
}

interface SeriesManagerProps {
  seriesSlug: string;
  seriesTitles: { title_en: string; title_es: string };
  seriesPresentation: SeriesPresentation;
  postsInSeries: PostRecord[];
  availablePosts: PostRecord[];
}

export function SeriesManager({
  seriesSlug,
  seriesTitles,
  seriesPresentation,
  postsInSeries,
  availablePosts,
}: SeriesManagerProps) {
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

  const presentationReady = seriesPresentationComplete({
    slug: seriesSlug,
    title_en: seriesTitles.title_en,
    title_es: seriesTitles.title_es,
    description_en: seriesPresentation.description_en,
    description_es: seriesPresentation.description_es,
    cover_image_url: seriesPresentation.cover_image_url,
  });

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {!presentationReady ? (
        <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Public cards at <code className="text-amber-100">/series</code> use the description and
          cover below. Fill both languages for a complete card.
        </p>
      ) : null}

      <SeriesPresentationForm
        seriesSlug={seriesSlug}
        initialPresentation={seriesPresentation}
        disabled={pending}
      />

      <SeriesTitlesForm
        seriesSlug={seriesSlug}
        initialTitles={seriesTitles}
        disabled={pending}
      />

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
                    {String(post.series?.position ?? index + 1).padStart(2, '0')}
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
                    {post.series?.series_slug ? ` (from ${post.series.series_slug})` : ''}
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

function SeriesPresentationForm({
  seriesSlug,
  initialPresentation,
  disabled,
}: {
  seriesSlug: string;
  initialPresentation: SeriesPresentation;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [descriptionEn, setDescriptionEn] = useState(initialPresentation.description_en);
  const [descriptionEs, setDescriptionEs] = useState(initialPresentation.description_es);
  const [coverUrl, setCoverUrl] = useState(initialPresentation.cover_image_url);

  useEffect(() => {
    setDescriptionEn(initialPresentation.description_en);
    setDescriptionEs(initialPresentation.description_es);
    setCoverUrl(initialPresentation.cover_image_url);
  }, [initialPresentation]);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="surface-card space-y-4 p-5">
      <div className="space-y-1">
        <h2 className="font-display text-lg text-ink">Card &amp; series page</h2>
        <p className="text-sm text-ink-muted">
          Description and cover shown on <code className="text-meta-400">/series</code> cards and the
          series hub header. Upload uses the same storage as post covers.
        </p>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await updateSeriesPresentationAction(seriesSlug, {
              description_en: descriptionEn,
              description_es: descriptionEs,
              cover_image_url: coverUrl,
            });
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="series-desc-en" className="mb-1 block text-sm text-ink-muted">
              Card description (EN)
            </label>
            <textarea
              id="series-desc-en"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={4}
              maxLength={320}
              placeholder="Short pitch for the series card — what readers will learn, in one or two sentences."
              className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70"
            />
            <p className="mt-1 text-xs text-ink-muted">{descriptionEn.length}/320</p>
          </div>
          <div>
            <label htmlFor="series-desc-es" className="mb-1 block text-sm text-ink-muted">
              Card description (ES)
            </label>
            <textarea
              id="series-desc-es"
              value={descriptionEs}
              onChange={(e) => setDescriptionEs(e.target.value)}
              rows={4}
              maxLength={320}
              placeholder="Texto corto para la card — qué aprenderán, en una o dos frases."
              className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70"
            />
            <p className="mt-1 text-xs text-ink-muted">{descriptionEs.length}/320</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-ink-muted">Cover image (2:1 recommended)</p>
          <CoverImageUpload
            key={initialPresentation.cover_image_url}
            defaultValue={initialPresentation.cover_image_url}
            onChange={setCoverUrl}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || pending}
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-dark-950 transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Save presentation
        </button>
      </form>
    </section>
  );
}

function SeriesTitlesForm({
  seriesSlug,
  initialTitles,
  disabled,
}: {
  seriesSlug: string;
  initialTitles: { title_en: string; title_es: string };
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [titleEn, setTitleEn] = useState(initialTitles.title_en);
  const [titleEs, setTitleEs] = useState(initialTitles.title_es);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="surface-card space-y-3 p-5">
      <h2 className="font-display text-lg text-ink">Series titles</h2>
      <p className="text-sm text-ink-muted">Shown on public series pages and navigation.</p>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await updateSeriesTitlesAction(seriesSlug, {
              title_en: titleEn,
              title_es: titleEs,
            });
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <div>
          <label htmlFor="title-en" className="mb-1 block text-sm text-ink-muted">
            Title (EN)
          </label>
          <input
            id="title-en"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label htmlFor="title-es" className="mb-1 block text-sm text-ink-muted">
            Title (ES)
          </label>
          <input
            id="title-es"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-dark-900/80 px-3 py-2 text-sm text-ink"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || pending}
          className="sm:col-span-2 w-fit rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          Save titles
        </button>
      </form>
    </section>
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

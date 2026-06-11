'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import type { PostRecord } from '@/lib/posts/types';
import {
  deletePostAction,
  publishPostAction,
  savePostFormAction,
  unpublishPostAction,
} from '@/lib/posts/actions';

interface PostEditorFormProps {
  post?: PostRecord;
}

export function PostEditorForm({ post }: PostEditorFormProps) {
  const router = useRouter();
  const [state, formAction, savePending] = useActionState(savePostFormAction, {});
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.error) return;
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        {post ? <input type="hidden" name="postId" value={post.id} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Category</label>
            <select
              name="category"
              defaultValue={post?.category ?? 'backend'}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-muted">Cover image URL (optional)</label>
            <p className="mb-2 text-xs text-ink-muted">
              Shown on the article page, post cards, and social previews (Open Graph).
            </p>
            <input
              name="cover_image_url"
              type="url"
              defaultValue={post?.cover_image_url ?? ''}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
        </div>

        {post ? (
          <p className="rounded-lg border border-white/8 bg-dark-800/50 px-3 py-2 font-mono text-xs text-ink-muted">
            Slugs (auto): EN /blog/{post.slug_en} · ES /blog/{post.slug_es}
          </p>
        ) : (
          <p className="text-xs text-ink-muted">
            Slugs are generated automatically from each title when you save.
          </p>
        )}

        <fieldset className="space-y-4 rounded-xl border border-white/8 p-4">
          <legend className="px-1 text-sm font-medium text-ink">English</legend>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Title (EN)</label>
            <input
              name="title_en"
              defaultValue={post?.title_en}
              required
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Excerpt (EN, optional)</label>
            <input
              name="excerpt_en"
              defaultValue={post?.excerpt_en}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Body markdown (EN)</label>
            <textarea
              name="body_md_en"
              defaultValue={post?.body_md_en}
              required
              rows={14}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 font-mono text-sm leading-relaxed text-ink"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl border border-white/8 p-4">
          <legend className="px-1 text-sm font-medium text-ink">Español</legend>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Título (ES)</label>
            <input
              name="title_es"
              defaultValue={post?.title_es}
              required
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Extracto (ES, opcional)</label>
            <input
              name="excerpt_es"
              defaultValue={post?.excerpt_es}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Cuerpo markdown (ES)</label>
            <textarea
              name="body_md_es"
              defaultValue={post?.body_md_es}
              required
              rows={14}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 font-mono text-sm leading-relaxed text-ink"
            />
          </div>
        </fieldset>

        {state.error ? (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={savePending}
          className="rounded-lg bg-meta-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {savePending ? 'Saving…' : 'Save draft'}
        </button>
      </form>

      {post ? (
        <div className="flex flex-wrap gap-3 border-t border-white/8 pt-4">
          {post.status === 'draft' ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => runAction(() => publishPostAction(post.id))}
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Publish
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => runAction(() => unpublishPostAction(post.id))}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-ink disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
          {post.status === 'published' ? (
            <>
              <a
                href={`/blog/${post.slug_en}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-meta-500 hover:text-ink"
              >
                View EN ↗
              </a>
              <a
                href={`/blog/${post.slug_es}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-meta-500 hover:text-ink"
              >
                View ES ↗
              </a>
            </>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm('Delete this post permanently?')) {
                startTransition(async () => {
                  await deletePostAction(post.id);
                });
              }
            }}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

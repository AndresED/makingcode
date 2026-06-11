'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import type { PostDetail } from '@/lib/posts/types';
import {
  deletePostAction,
  publishPostAction,
  savePostFormAction,
  unpublishPostAction,
} from '@/lib/posts/actions';

interface PostEditorFormProps {
  post?: PostDetail;
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
      <form action={formAction} className="space-y-4">
        {post ? <input type="hidden" name="postId" value={post.id} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-muted">Title</label>
            <input
              name="title"
              defaultValue={post?.title}
              required
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-muted">Slug</label>
            <input
              name="slug"
              defaultValue={post?.slug}
              placeholder="auto-from-title"
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 font-mono text-sm text-ink"
            />
          </div>
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
            <label className="mb-1 block text-sm text-ink-muted">Excerpt (optional)</label>
            <input
              name="excerpt"
              defaultValue={post?.excerpt}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-muted">Cover image URL (optional)</label>
            <input
              name="cover_image_url"
              type="url"
              defaultValue={post?.cover_image_url ?? ''}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 text-ink"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-ink-muted">Markdown body</label>
            <textarea
              name="body_md"
              defaultValue={post?.body_md}
              required
              rows={18}
              className="w-full rounded-lg border border-white/10 bg-dark-800 px-3 py-2 font-mono text-sm leading-relaxed text-ink"
            />
          </div>
        </div>
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
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-meta-500 hover:text-ink"
            >
              View live ↗
            </a>
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

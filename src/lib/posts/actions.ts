'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/auth/session';
import { markdownToHtml } from '@/lib/markdown/render';
import { createClient } from '@/lib/supabase/server';
import { POST_CATEGORIES, type PostCategory } from './categories';
import { resolveUniqueSlugs } from './slug-unique';
import {
  estimateReadingTimeMinutes,
  excerptFromMarkdown,
} from './utils';

const postSchema = z.object({
  title_en: z.string().min(3).max(200),
  title_es: z.string().min(3).max(200),
  excerpt_en: z.string().max(320).optional(),
  excerpt_es: z.string().max(320).optional(),
  body_md_en: z.string().min(1),
  body_md_es: z.string().min(1),
  category: z.enum(POST_CATEGORIES as unknown as [PostCategory, ...PostCategory[]]),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  series_slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .or(z.literal('')),
  series_order: z
    .union([z.coerce.number().int().min(1).max(99), z.literal('').transform(() => undefined)])
    .optional(),
});

function withoutSeriesFields<T extends { series_slug?: string | null; series_order?: number | null }>(
  payload: T,
): Omit<T, 'series_slug' | 'series_order'> {
  const { series_slug: _slug, series_order: _order, ...rest } = payload;
  void _slug;
  void _order;
  return rest;
}

function isMissingSeriesColumnsError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes('series_slug') || lower.includes('series_order');
}

function revalidateBlogPaths(slugs: string[]) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/api/feed');
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function savePostFormAction(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const postId = String(formData.get('postId') ?? '').trim() || null;
  const result = await savePostAction(postId, formData);
  return result ?? {};
}

export async function savePostAction(
  postId: string | null,
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const raw = {
    title_en: String(formData.get('title_en') ?? ''),
    title_es: String(formData.get('title_es') ?? ''),
    excerpt_en: String(formData.get('excerpt_en') ?? ''),
    excerpt_es: String(formData.get('excerpt_es') ?? ''),
    body_md_en: String(formData.get('body_md_en') ?? ''),
    body_md_es: String(formData.get('body_md_es') ?? ''),
    category: String(formData.get('category') ?? ''),
    cover_image_url: String(formData.get('cover_image_url') ?? ''),
    series_slug: String(formData.get('series_slug') ?? '').trim(),
    series_order: String(formData.get('series_order') ?? '').trim(),
  };

  const parsed = postSchema.safeParse({
    ...raw,
    excerpt_en: raw.excerpt_en || undefined,
    excerpt_es: raw.excerpt_es || undefined,
    cover_image_url: raw.cover_image_url || undefined,
    series_slug: raw.series_slug || undefined,
    series_order: raw.series_order || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const {
    title_en,
    title_es,
    body_md_en,
    body_md_es,
    category,
    cover_image_url,
    series_slug,
    series_order,
  } = parsed.data;

  const slugs = await resolveUniqueSlugs(title_en, title_es, postId ?? undefined);
  if (slugs.error) return { error: slugs.error };

  const excerpt_en = parsed.data.excerpt_en ?? excerptFromMarkdown(body_md_en);
  const excerpt_es = parsed.data.excerpt_es ?? excerptFromMarkdown(body_md_es);
  const [body_html_en, body_html_es] = await Promise.all([
    markdownToHtml(body_md_en),
    markdownToHtml(body_md_es),
  ]);
  const reading_time_minutes = Math.max(
    estimateReadingTimeMinutes(body_md_en),
    estimateReadingTimeMinutes(body_md_es),
  );

  const payload = {
    title_en,
    title_es,
    slug_en: slugs.slug_en,
    slug_es: slugs.slug_es,
    excerpt_en,
    excerpt_es,
    body_md_en,
    body_md_es,
    body_html_en,
    body_html_es,
    category,
    cover_image_url: cover_image_url || null,
    series_slug: series_slug || null,
    series_order: series_order ?? null,
    reading_time_minutes,
  };

  const supabase = await createClient();

  if (postId) {
    let { error } = await supabase.from('posts').update(payload).eq('id', postId);

    if (isMissingSeriesColumnsError(error?.message)) {
      const retry = await supabase
        .from('posts')
        .update(withoutSeriesFields(payload))
        .eq('id', postId);
      error = retry.error;
    }

    if (error) return { error: error.message };
    revalidateBlogPaths([slugs.slug_en, slugs.slug_es]);
    return { id: postId };
  }

  let { data, error } = await supabase
    .from('posts')
    .insert({
      ...payload,
      status: 'draft',
      author_id: session.user.id,
    })
    .select('id')
    .single();

  if (isMissingSeriesColumnsError(error?.message)) {
    const retry = await supabase
      .from('posts')
      .insert({
        ...withoutSeriesFields(payload),
        status: 'draft',
        author_id: session.user.id,
      })
      .select('id')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) return { error: error.message };
  if (!data) return { error: 'Failed to create post' };
  revalidateBlogPaths([slugs.slug_en, slugs.slug_es]);
  redirect(`/dashboard/posts/${data.id}/edit`);
}

export async function publishPostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('id', postId)
    .single();
  if (!post) return { error: 'Post not found' };

  const { error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateBlogPaths([post.slug_en, post.slug_es]);
  return {};
}

export async function unpublishPostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('id', postId)
    .single();
  if (!post) return { error: 'Post not found' };

  const { error } = await supabase
    .from('posts')
    .update({ status: 'draft', published_at: null })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateBlogPaths([post.slug_en, post.slug_es]);
  return {};
}

export async function deletePostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('id', postId)
    .single();

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return { error: error.message };

  if (post) revalidateBlogPaths([post.slug_en, post.slug_es]);
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

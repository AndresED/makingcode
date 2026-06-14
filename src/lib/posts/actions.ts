'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/auth/session';
import { markdownToHtml } from '@/lib/markdown/render';
import { createClient } from '@/lib/supabase/server';
import { POST_CATEGORIES, type PostCategory } from './categories';
import { resolveUniqueSlugs } from './slug-unique';
import { getSeriesSlugForPostId } from './series-repository';
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
});

function revalidateBlogPaths(slugs: string[], seriesSlug?: string | null) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/about');
  revalidatePath('/sitemap.xml');
  revalidatePath('/api/feed');
  for (const category of POST_CATEGORIES) {
    revalidatePath(`/categories/${category}`);
  }
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }
  if (seriesSlug) {
    revalidatePath('/series');
    revalidatePath(`/series/${seriesSlug}`);
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
  };

  const parsed = postSchema.safeParse({
    ...raw,
    excerpt_en: raw.excerpt_en || undefined,
    excerpt_es: raw.excerpt_es || undefined,
    cover_image_url: raw.cover_image_url || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { title_en, title_es, body_md_en, body_md_es, category, cover_image_url } = parsed.data;

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
    reading_time_minutes,
  };

  const supabase = await createClient();

  if (postId) {
    const { error } = await supabase.from('posts').update(payload).eq('id', postId);
    if (error) return { error: error.message };

    const seriesSlug = await getSeriesSlugForPostId(postId);
    revalidateBlogPaths([slugs.slug_en, slugs.slug_es], seriesSlug);
    return { id: postId };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...payload,
      status: 'draft',
      author_id: session.user.id,
    })
    .select('id')
    .single();

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
    .select('slug_en, slug_es, cover_image_url')
    .eq('id', postId)
    .single();
  if (!post) return { error: 'Post not found' };

  if (!post.cover_image_url?.trim()) {
    return { error: 'Cover image is required before publishing.' };
  }

  const { error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) return { error: error.message };

  const seriesSlug = await getSeriesSlugForPostId(postId);
  revalidateBlogPaths([post.slug_en, post.slug_es], seriesSlug);
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

  const seriesSlug = await getSeriesSlugForPostId(postId);

  const { error } = await supabase
    .from('posts')
    .update({ status: 'draft', published_at: null })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateBlogPaths([post.slug_en, post.slug_es], seriesSlug);
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

  const seriesSlug = await getSeriesSlugForPostId(postId);

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return { error: error.message };

  if (post) revalidateBlogPaths([post.slug_en, post.slug_es], seriesSlug);
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

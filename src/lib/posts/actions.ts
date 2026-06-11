'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/auth/session';
import { markdownToHtmlSync } from '@/lib/markdown/render';
import { createClient } from '@/lib/supabase/server';
import { POST_CATEGORIES, type PostCategory } from './categories';
import {
  estimateReadingTimeMinutes,
  excerptFromMarkdown,
  isValidSlug,
  slugify,
} from './utils';

const postSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().max(120),
  excerpt: z.string().min(20).max(320).optional(),
  body_md: z.string().min(1),
  category: z.enum(POST_CATEGORIES as unknown as [PostCategory, ...PostCategory[]]),
  cover_image_url: z.string().url().optional().or(z.literal('')),
});

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/api/feed');
  if (slug) {
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
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    excerpt: String(formData.get('excerpt') ?? ''),
    body_md: String(formData.get('body_md') ?? ''),
    category: String(formData.get('category') ?? ''),
    cover_image_url: String(formData.get('cover_image_url') ?? ''),
  };

  const parsed = postSchema.safeParse({
    ...raw,
    slug: raw.slug || slugify(raw.title),
    excerpt: raw.excerpt || undefined,
    cover_image_url: raw.cover_image_url || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const { title, slug, body_md, category, cover_image_url } = parsed.data;
  if (!isValidSlug(slug)) {
    return { error: 'Invalid slug format' };
  }

  const excerpt = parsed.data.excerpt ?? excerptFromMarkdown(body_md);
  const body_html = markdownToHtmlSync(body_md);
  const reading_time_minutes = estimateReadingTimeMinutes(body_md);

  const supabase = await createClient();

  if (postId) {
    const { error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        excerpt,
        body_md,
        body_html,
        category,
        cover_image_url: cover_image_url || null,
        reading_time_minutes,
      })
      .eq('id', postId);

    if (error) return { error: error.message };
    revalidateBlogPaths(slug);
    return { id: postId };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      excerpt,
      body_md,
      body_html,
      category,
      cover_image_url: cover_image_url || null,
      reading_time_minutes,
      status: 'draft',
      author_id: session.user.id,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidateBlogPaths(slug);
  redirect(`/dashboard/posts/${data.id}/edit`);
}

export async function publishPostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('slug').eq('id', postId).single();
  if (!post) return { error: 'Post not found' };

  const { error } = await supabase
    .from('posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateBlogPaths(post.slug);
  return {};
}

export async function unpublishPostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('slug').eq('id', postId).single();
  if (!post) return { error: 'Post not found' };

  const { error } = await supabase
    .from('posts')
    .update({ status: 'draft', published_at: null })
    .eq('id', postId);

  if (error) return { error: error.message };
  revalidateBlogPaths(post.slug);
  return {};
}

export async function deletePostAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('slug').eq('id', postId).single();

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return { error: error.message };

  if (post?.slug) revalidateBlogPaths(post.slug);
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

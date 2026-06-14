'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/auth/session';
import {
  isValidSeriesSlug,
  listPostsInSeriesAdmin,
  nextSeriesOrder,
} from '@/lib/posts/series-admin';
import { createClient } from '@/lib/supabase/server';

const seriesSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

function revalidateSeriesPaths(seriesSlug: string, postSlugs: string[] = []) {
  revalidatePath('/dashboard/series');
  revalidatePath(`/dashboard/series/${seriesSlug}`);
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/series/${seriesSlug}`);
  for (const slug of postSlugs) {
    revalidatePath(`/blog/${slug}`);
  }
}

async function getPostSlugs(postId: string): Promise<{ slug_en: string; slug_es: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('id', postId)
    .maybeSingle();
  return data ?? null;
}

export async function assignPostToSeriesAction(
  postId: string,
  seriesSlug: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const parsed = seriesSlugSchema.safeParse(seriesSlug.trim());
  if (!parsed.success) return { error: 'Invalid series slug' };

  const slug = parsed.data;
  const inSeries = await listPostsInSeriesAdmin(slug);
  const order = nextSeriesOrder(inSeries);

  const supabase = await createClient();
  const { error } = await supabase
    .from('posts')
    .update({ series_slug: slug, series_order: order })
    .eq('id', postId);

  if (error) return { error: error.message };

  const slugs = await getPostSlugs(postId);
  revalidateSeriesPaths(slug, slugs ? [slugs.slug_en, slugs.slug_es] : []);
  return {};
}

export async function removePostFromSeriesAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('slug_en, slug_es, series_slug')
    .eq('id', postId)
    .maybeSingle();

  const previousSlug = post?.series_slug?.trim() ?? '';

  const { error } = await supabase
    .from('posts')
    .update({ series_slug: null, series_order: null })
    .eq('id', postId);

  if (error) return { error: error.message };

  if (previousSlug) {
    await normalizeSeriesOrderAction(previousSlug);
    revalidateSeriesPaths(previousSlug, post ? [post.slug_en, post.slug_es] : []);
  }

  return {};
}

export async function moveSeriesPostAction(
  postId: string,
  seriesSlug: string,
  direction: 'up' | 'down',
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };
  if (!isValidSeriesSlug(seriesSlug)) return { error: 'Invalid series slug' };

  const ordered = await listPostsInSeriesAdmin(seriesSlug);
  const index = ordered.findIndex((p) => p.id === postId);
  if (index === -1) return { error: 'Post not in series' };

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) return {};

  const current = ordered[index];
  const neighbor = ordered[swapIndex];
  const currentOrder = current.series_order ?? index + 1;
  const neighborOrder = neighbor.series_order ?? swapIndex + 1;

  const supabase = await createClient();
  const [u1, u2] = await Promise.all([
    supabase.from('posts').update({ series_order: neighborOrder }).eq('id', current.id),
    supabase.from('posts').update({ series_order: currentOrder }).eq('id', neighbor.id),
  ]);

  if (u1.error) return { error: u1.error.message };
  if (u2.error) return { error: u2.error.message };

  revalidateSeriesPaths(seriesSlug, [
    current.slug_en,
    current.slug_es,
    neighbor.slug_en,
    neighbor.slug_es,
  ]);
  return {};
}

async function normalizeSeriesOrderAction(seriesSlug: string): Promise<void> {
  const ordered = await listPostsInSeriesAdmin(seriesSlug);
  const supabase = await createClient();

  await Promise.all(
    ordered.map((post, index) =>
      supabase
        .from('posts')
        .update({ series_order: index + 1 })
        .eq('id', post.id),
    ),
  );
}

export async function renameSeriesSlugAction(
  oldSlug: string,
  newSlug: string,
): Promise<{ error?: string; newSlug?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const parsed = seriesSlugSchema.safeParse(newSlug.trim());
  if (!parsed.success) return { error: 'Invalid series slug' };
  if (oldSlug === parsed.data) return {};

  const supabase = await createClient();
  const { data: posts, error: findError } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('series_slug', oldSlug);

  if (findError) return { error: findError.message };
  if (!posts?.length) return { error: 'Series not found' };

  const { error } = await supabase
    .from('posts')
    .update({ series_slug: parsed.data })
    .eq('series_slug', oldSlug);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/series/${oldSlug}`);
  revalidateSeriesPaths(
    parsed.data,
    posts.flatMap((p) => [p.slug_en, p.slug_es]),
  );
  revalidatePath(`/series/${oldSlug}`);
  return { newSlug: parsed.data };
}

export async function createSeriesRedirectAction(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const slug = String(formData.get('series_slug') ?? '').trim().toLowerCase();
  if (!isValidSeriesSlug(slug)) {
    return { error: 'Use lowercase letters, numbers and hyphens (e.g. nestjs-enterprise)' };
  }

  redirect(`/dashboard/series/${slug}`);
}

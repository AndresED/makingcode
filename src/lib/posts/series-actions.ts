'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAdminSession } from '@/lib/auth/session';
import {
  assignPostToSeries,
  getPostSeriesBySlug,
  isValidSeriesSlug,
  removePostFromSeries,
  swapSeriesMemberPositions,
  updatePostSeriesRecord,
  upsertPostSeriesBySlug,
} from '@/lib/posts/series-repository';
import { createClient } from '@/lib/supabase/server';

const seriesSlugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function revalidateSeriesPaths(seriesSlug: string, postSlugs: string[] = []) {
  revalidatePath('/dashboard/series');
  revalidatePath(`/dashboard/series/${seriesSlug}`);
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/series');
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

  try {
    const series = await upsertPostSeriesBySlug(parsed.data);
    await assignPostToSeries(postId, series.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to assign post' };
  }

  const slugs = await getPostSlugs(postId);
  revalidateSeriesPaths(parsed.data, slugs ? [slugs.slug_en, slugs.slug_es] : []);
  return {};
}

export async function removePostFromSeriesAction(postId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('slug_en, slug_es')
    .eq('id', postId)
    .maybeSingle();

  try {
    const previousSlug = await removePostFromSeries(postId);
    if (previousSlug) {
      revalidateSeriesPaths(previousSlug, post ? [post.slug_en, post.slug_es] : []);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to remove post' };
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

  const series = await getPostSeriesBySlug(seriesSlug);
  if (!series) return { error: 'Series not found' };

  const supabase = await createClient();
  const { data: members } = await supabase
    .from('post_series_members')
    .select('post_id, post:posts(slug_en, slug_es)')
    .eq('series_id', series.id)
    .order('position', { ascending: true });

  try {
    await swapSeriesMemberPositions(series.id, postId, direction);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to reorder' };
  }

  const slugs =
    members?.flatMap((row) => {
      const post = unwrapJoin(
        row.post as { slug_en: string; slug_es: string } | { slug_en: string; slug_es: string }[] | null,
      );
      return post ? [post.slug_en, post.slug_es] : [];
    }) ?? [];

  revalidateSeriesPaths(seriesSlug, slugs);
  return {};
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

  const series = await getPostSeriesBySlug(oldSlug);
  if (!series) return { error: 'Series not found' };

  const supabase = await createClient();
  const { data: members } = await supabase
    .from('post_series_members')
    .select('post:posts(slug_en, slug_es)')
    .eq('series_id', series.id);

  try {
    await updatePostSeriesRecord(series.id, { slug: parsed.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to rename series' };
  }

  revalidatePath(`/dashboard/series/${oldSlug}`);
  revalidateSeriesPaths(
    parsed.data,
    (members ?? []).flatMap((row) => {
      const post = unwrapJoin(
        row.post as { slug_en: string; slug_es: string } | { slug_en: string; slug_es: string }[] | null,
      );
      return post ? [post.slug_en, post.slug_es] : [];
    }),
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

  try {
    await upsertPostSeriesBySlug(slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create series' };
  }

  redirect(`/dashboard/series/${slug}`);
}

export async function updateSeriesTitlesAction(
  seriesSlug: string,
  titles: { title_en: string; title_es: string },
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: 'Unauthorized' };

  const series = await getPostSeriesBySlug(seriesSlug);
  if (!series) return { error: 'Series not found' };

  const title_en = titles.title_en.trim();
  const title_es = titles.title_es.trim();
  if (title_en.length < 2 || title_es.length < 2) {
    return { error: 'Titles must be at least 2 characters' };
  }

  try {
    await updatePostSeriesRecord(series.id, { title_en, title_es });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update titles' };
  }

  revalidateSeriesPaths(seriesSlug);
  return {};
}

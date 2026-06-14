import { cache } from 'react';
import type { PostRecord, PostSeriesMembership } from './types';

export type { PostSeriesMembership };

export interface PostSeriesRecord {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  description_en: string | null;
  description_es: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostSeriesMemberRow {
  id: string;
  series_id: string;
  post_id: string;
  position: number;
  created_at: string;
}

export interface AdminSeriesSummary {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  postCount: number;
  publishedCount: number;
}

export const SERIES_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSeriesSlug(slug: string): boolean {
  return SERIES_SLUG_PATTERN.test(slug) && slug.length <= 80;
}

function slugToDefaultTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type SupabaseClient = Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>;

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

async function getAdminClient(): Promise<SupabaseClient> {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

async function getAnonClient() {
  const { createAnonClient } = await import('@/lib/supabase/anon');
  return createAnonClient();
}

export async function listPostSeriesRecords(): Promise<PostSeriesRecord[]> {
  const supabase = await getAnonClient();
  const { data, error } = await supabase
    .from('post_series')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PostSeriesRecord[];
}

export const getPostSeriesBySlug = cache(async (slug: string): Promise<PostSeriesRecord | null> => {
  const supabase = await getAnonClient();
  const { data, error } = await supabase
    .from('post_series')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PostSeriesRecord | null) ?? null;
});

export async function getPostSeriesById(id: string): Promise<PostSeriesRecord | null> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('post_series')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as PostSeriesRecord | null) ?? null;
}

export async function upsertPostSeriesBySlug(
  slug: string,
  titles?: { title_en?: string; title_es?: string },
): Promise<PostSeriesRecord> {
  const supabase = await getAdminClient();
  const title = titles?.title_en?.trim() || slugToDefaultTitle(slug);
  const titleEs = titles?.title_es?.trim() || title;

  const { data: existing } = await supabase
    .from('post_series')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) return existing as PostSeriesRecord;

  const { data, error } = await supabase
    .from('post_series')
    .insert({ slug, title_en: title, title_es: titleEs })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as PostSeriesRecord;
}

export async function updatePostSeriesRecord(
  id: string,
  patch: Partial<
    Pick<PostSeriesRecord, 'slug' | 'title_en' | 'title_es' | 'description_en' | 'description_es'>
  >,
): Promise<PostSeriesRecord> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('post_series')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as PostSeriesRecord;
}

export async function deletePostSeriesIfEmpty(seriesId: string): Promise<void> {
  const supabase = await getAdminClient();
  const { count, error: countError } = await supabase
    .from('post_series_members')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return;

  const { error } = await supabase.from('post_series').delete().eq('id', seriesId);
  if (error) throw new Error(error.message);
}

export async function listSeriesMembershipsForPostIds(
  postIds: string[],
  options?: { publishedOnly?: boolean },
): Promise<Map<string, PostSeriesMembership>> {
  if (postIds.length === 0) return new Map();

  const supabase = await getAnonClient();
  const { data, error } = await supabase
    .from('post_series_members')
    .select('post_id, position, series:post_series(id, slug, title_en, title_es)')
    .in('post_id', postIds);

  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('post_series') ||
      message.includes('is_admin') ||
      message.includes('permission denied')
    ) {
      return new Map();
    }
    throw new Error(error.message);
  }

  const map = new Map<string, PostSeriesMembership>();
  for (const row of data ?? []) {
    const series = unwrapJoin(
      row.series as
        | { id: string; slug: string; title_en: string; title_es: string }
        | Array<{ id: string; slug: string; title_en: string; title_es: string }>
        | null
        | undefined,
    );
    if (!series) continue;

    if (options?.publishedOnly) {
      // RLS on members already filters unpublished for anon; admin client not used here.
    }

    map.set(row.post_id as string, {
      series_id: series.id,
      series_slug: series.slug,
      title_en: series.title_en,
      title_es: series.title_es,
      position: row.position as number,
    });
  }

  return map;
}

export function attachSeriesToPosts(
  posts: PostRecord[],
  memberships: Map<string, PostSeriesMembership>,
): PostRecord[] {
  return posts.map((post) => ({
    ...post,
    series: memberships.get(post.id) ?? null,
  }));
}

export async function getSeriesSlugForPostId(postId: string): Promise<string | null> {
  const memberships = await listSeriesMembershipsForPostIds([postId]);
  return memberships.get(postId)?.series_slug ?? null;
}

function membershipFromSeries(series: PostSeriesRecord, position: number): PostSeriesMembership {
  return {
    series_id: series.id,
    series_slug: series.slug,
    title_en: series.title_en,
    title_es: series.title_es,
    position,
  };
}

export const getPublishedSeriesWithPosts = cache(async (
  seriesSlug: string,
): Promise<{ series: PostSeriesRecord; posts: PostRecord[] } | null> => {
  const supabase = await getAnonClient();
  const { data, error } = await supabase
    .from('post_series')
    .select(
      '*, members:post_series_members(position, post:posts(*))',
    )
    .eq('slug', seriesSlug)
    .maybeSingle();

  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('post_series') ||
      message.includes('is_admin') ||
      message.includes('permission denied')
    ) {
      return null;
    }
    throw new Error(error.message);
  }

  if (!data) return null;

  const row = data as PostSeriesRecord & {
    members: Array<{ position: number; post: PostRecord | PostRecord[] | null }>;
  };

  const posts: PostRecord[] = [];
  for (const member of row.members ?? []) {
    const post = unwrapJoin(member.post);
    if (!post || post.status !== 'published') continue;
    posts.push({
      ...post,
      series: membershipFromSeries(row, member.position),
    });
  }

  posts.sort((a, b) => (a.series?.position ?? 0) - (b.series?.position ?? 0));

  const { members: _drop, ...series } = row;
  void _drop;

  return { series: series as PostSeriesRecord, posts };
});

export async function enrichPostsWithSeries(
  posts: PostRecord[],
  options?: { publishedOnly?: boolean },
): Promise<PostRecord[]> {
  const memberships = await listSeriesMembershipsForPostIds(
    posts.map((p) => p.id),
    options,
  );
  return attachSeriesToPosts(posts, memberships);
}

export async function listMembersForSeriesSlug(
  seriesSlug: string,
  options?: { publishedOnly?: boolean },
): Promise<Array<PostSeriesMemberRow & { post: PostRecord }>> {
  const series = await getPostSeriesBySlug(seriesSlug);
  if (!series) return [];

  const supabase = options?.publishedOnly ? await getAnonClient() : await getAdminClient();
  const { data, error } = await supabase
    .from('post_series_members')
    .select('id, series_id, post_id, position, created_at, post:posts(*)')
    .eq('series_id', series.id)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);

  const rows: Array<PostSeriesMemberRow & { post: PostRecord }> = [];
  for (const row of data ?? []) {
    const post = unwrapJoin(row.post as PostRecord | PostRecord[] | null);
    if (!post) continue;
    if (options?.publishedOnly && post.status !== 'published') continue;
    rows.push({
      id: row.id as string,
      series_id: row.series_id as string,
      post_id: row.post_id as string,
      position: row.position as number,
      created_at: row.created_at as string,
      post,
    });
  }

  return rows;
}

export async function listAdminSeriesSummaries(): Promise<AdminSeriesSummary[]> {
  const supabase = await getAdminClient();
  const { data: seriesRows, error: seriesError } = await supabase
    .from('post_series')
    .select('*')
    .order('updated_at', { ascending: false });

  if (seriesError) throw new Error(seriesError.message);

  const { data: memberRows, error: memberError } = await supabase
    .from('post_series_members')
    .select('series_id, post:posts(status)');

  if (memberError) throw new Error(memberError.message);

  const counts = new Map<string, { postCount: number; publishedCount: number }>();
  for (const row of memberRows ?? []) {
    const seriesId = row.series_id as string;
    const status = unwrapJoin(row.post as { status: string } | { status: string }[] | null)?.status;
    const current = counts.get(seriesId) ?? { postCount: 0, publishedCount: 0 };
    current.postCount += 1;
    if (status === 'published') current.publishedCount += 1;
    counts.set(seriesId, current);
  }

  return ((seriesRows ?? []) as PostSeriesRecord[]).map((series) => {
    const stats = counts.get(series.id) ?? { postCount: 0, publishedCount: 0 };
    return {
      id: series.id,
      slug: series.slug,
      title_en: series.title_en,
      title_es: series.title_es,
      postCount: stats.postCount,
      publishedCount: stats.publishedCount,
    };
  });
}

export async function countPostsWithoutSeriesAdmin(): Promise<number> {
  const supabase = await getAdminClient();
  const { data: posts, error: postsError } = await supabase.from('posts').select('id');
  if (postsError) throw new Error(postsError.message);

  const { data: members, error: membersError } = await supabase
    .from('post_series_members')
    .select('post_id');
  if (membersError) throw new Error(membersError.message);

  const assigned = new Set((members ?? []).map((m) => m.post_id as string));
  return (posts ?? []).filter((p) => !assigned.has(p.id as string)).length;
}

export async function nextSeriesPosition(seriesId: string): Promise<number> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('post_series_members')
    .select('position')
    .eq('series_id', seriesId)
    .order('position', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  const max = data?.[0]?.position ?? 0;
  return Number(max) + 1;
}

export async function assignPostToSeries(
  postId: string,
  seriesId: string,
  position?: number,
): Promise<void> {
  const supabase = await getAdminClient();
  const resolvedPosition = position ?? (await nextSeriesPosition(seriesId));

  const { error } = await supabase.from('post_series_members').upsert(
    {
      series_id: seriesId,
      post_id: postId,
      position: resolvedPosition,
    },
    { onConflict: 'post_id' },
  );

  if (error) throw new Error(error.message);
}

export async function removePostFromSeries(postId: string): Promise<string | null> {
  const supabase = await getAdminClient();

  const { data: member } = await supabase
    .from('post_series_members')
    .select('series_id, post_series(slug)')
    .eq('post_id', postId)
    .maybeSingle();

  const seriesSlug =
    unwrapJoin(member?.post_series as { slug: string } | { slug: string }[] | null | undefined)?.slug ??
    null;
  const seriesId = member?.series_id as string | undefined;

  const { error } = await supabase.from('post_series_members').delete().eq('post_id', postId);
  if (error) throw new Error(error.message);

  if (seriesId) {
    await normalizeSeriesPositions(seriesId);
    await deletePostSeriesIfEmpty(seriesId);
  }

  return seriesSlug;
}

export async function normalizeSeriesPositions(seriesId: string): Promise<void> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('post_series_members')
    .select('id, position')
    .eq('series_id', seriesId)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);

  await Promise.all(
    (data ?? []).map((row, index) =>
      supabase
        .from('post_series_members')
        .update({ position: index + 1 })
        .eq('id', row.id as string),
    ),
  );
}

export async function swapSeriesMemberPositions(
  seriesId: string,
  postId: string,
  direction: 'up' | 'down',
): Promise<void> {
  const supabase = await getAdminClient();
  const { data, error } = await supabase
    .from('post_series_members')
    .select('id, post_id, position')
    .eq('series_id', seriesId)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);

  const ordered = data ?? [];
  const index = ordered.findIndex((row) => row.post_id === postId);
  if (index === -1) throw new Error('Post not in series');

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ordered.length) return;

  const current = ordered[index];
  const neighbor = ordered[swapIndex];

  const [u1, u2] = await Promise.all([
    supabase
      .from('post_series_members')
      .update({ position: neighbor.position })
      .eq('id', current.id as string),
    supabase
      .from('post_series_members')
      .update({ position: current.position })
      .eq('id', neighbor.id as string),
  ]);

  if (u1.error) throw new Error(u1.error.message);
  if (u2.error) throw new Error(u2.error.message);
}

export async function listPublishedSeriesSlugs(): Promise<
  Array<{ slug: string; updated_at: string; postCount: number }>
> {
  const supabase = await getAnonClient();
  const { data, error } = await supabase
    .from('post_series')
    .select('slug, updated_at, members:post_series_members(post:posts(status))');

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{
    slug: string;
    updated_at: string;
    members: Array<{ post: { status: string } | null }>;
  }>)
    .map((series) => ({
      slug: series.slug,
      updated_at: series.updated_at,
      postCount: series.members.filter((m) => m.post?.status === 'published').length,
    }))
    .filter((s) => s.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount);
}

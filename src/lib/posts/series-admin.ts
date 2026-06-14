export {
  countPostsWithoutSeriesAdmin,
  isValidSeriesSlug,
  listAdminSeriesSummaries,
  SERIES_SLUG_PATTERN,
  type AdminSeriesSummary,
} from './series-repository';

import { listAllPostsForAdmin } from './repository';
import { enrichPostsWithSeries, listMembersForSeriesSlug } from './series-repository';
import type { PostRecord } from './types';

export async function listAllPostsForSeriesAdmin(): Promise<PostRecord[]> {
  return listAllPostsForAdmin();
}

export async function listPostsInSeriesAdmin(seriesSlug: string): Promise<PostRecord[]> {
  const members = await listMembersForSeriesSlug(seriesSlug);
  const posts = members.map((member) => member.post);
  return enrichPostsWithSeries(posts);
}

export async function listPostsAvailableForSeriesAdmin(seriesSlug: string): Promise<PostRecord[]> {
  const posts = await listAllPostsForSeriesAdmin();
  return posts
    .filter((post) => post.series?.series_slug !== seriesSlug)
    .sort((a, b) => a.title_en.localeCompare(b.title_en));
}

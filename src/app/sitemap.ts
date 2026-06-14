import type { MetadataRoute } from 'next';
import { listPublishedPostRecords } from '@/lib/posts/repository';
import { buildSitemap } from '@/lib/seo/build-sitemap';

/** Regenerate from Supabase every hour; also revalidated on publish via revalidatePath. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const records = await listPublishedPostRecords();
  return buildSitemap(records);
}

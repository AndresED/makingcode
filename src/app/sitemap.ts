import type { MetadataRoute } from 'next';
import { listPublishedPostRecords } from '@/lib/posts/repository';
import { buildSitemap, buildStaticSitemap } from '@/lib/seo/build-sitemap';

/** Regenerate from Supabase every hour; also revalidated on publish via revalidatePath. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const records = await listPublishedPostRecords();
    return buildSitemap(records);
  } catch (error) {
    console.error('[sitemap] Failed to load posts, serving static routes only:', error);
    return buildStaticSitemap();
  }
}

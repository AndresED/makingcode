import type { MetadataRoute } from 'next';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { listPublishedPostRecords } from '@/lib/posts/repository';
import { siteConfig } from '@/lib/seo/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = POST_CATEGORIES.map((category) => ({
    url: `${base}/categories/${category}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const records = await listPublishedPostRecords();
  const postRoutes: MetadataRoute.Sitemap = records.flatMap((post) => [
    {
      url: `${base}/blog/${post.slug_en}`,
      lastModified: new Date(post.published_at ?? post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${base}/blog/${post.slug_es}`,
      lastModified: new Date(post.published_at ?? post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]);

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}

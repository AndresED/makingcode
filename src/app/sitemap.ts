import type { MetadataRoute } from 'next';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { siteConfig } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Published posts appended in Phase 2 when Supabase is wired
  return [...staticRoutes, ...categoryRoutes];
}

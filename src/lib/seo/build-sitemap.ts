import type { MetadataRoute } from 'next';
import type { PostRecord } from '@/lib/posts/types';
import { POST_CATEGORIES } from '@/lib/posts/categories';
import { siteConfig } from './site';

function postLastModified(post: PostRecord): Date {
  return new Date(post.published_at ?? post.updated_at);
}

function postAlternates(base: string, post: PostRecord): MetadataRoute.Sitemap[number]['alternates'] {
  return {
    languages: {
      en: `${base}/blog/${post.slug_en}`,
      es: `${base}/blog/${post.slug_es}`,
      'x-default': `${base}/blog/${post.slug_en}`,
    },
  };
}

function buildPostRoutes(base: string, records: PostRecord[]): MetadataRoute.Sitemap {
  return records.flatMap((post) => {
    const entry = {
      lastModified: postLastModified(post),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: postAlternates(base, post),
    };

    const routes: MetadataRoute.Sitemap = [
      { url: `${base}/blog/${post.slug_en}`, ...entry },
    ];

    if (post.slug_es !== post.slug_en) {
      routes.push({ url: `${base}/blog/${post.slug_es}`, ...entry });
    }

    return routes;
  });
}

function buildSeriesRoutes(base: string, records: PostRecord[]): MetadataRoute.Sitemap {
  const seriesDates = new Map<string, Date>();

  for (const post of records) {
    const slug = post.series_slug?.trim();
    if (!slug) continue;

    const modified = postLastModified(post);
    const current = seriesDates.get(slug);
    if (!current || modified > current) {
      seriesDates.set(slug, modified);
    }
  }

  return [...seriesDates.entries()].map(([slug, lastModified]) => ({
    url: `${base}/series/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
}

export function buildSitemap(records: PostRecord[]): MetadataRoute.Sitemap {
  return [...buildStaticSitemap(), ...buildSeriesRoutes(siteConfig.url, records), ...buildPostRoutes(siteConfig.url, records)];
}

export function buildStaticSitemap(): MetadataRoute.Sitemap {
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

  return [...staticRoutes, ...categoryRoutes];
}

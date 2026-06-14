import type { Locale } from '@/lib/i18n/dictionary';
import { categoryLabel } from '@/lib/i18n/category';
import type { LocalizedPost } from '@/lib/posts/types';
import { toAbsoluteAssetUrl } from './asset-url';
import { siteConfig } from './site';

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: ['en', 'es'],
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function buildPersonJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: siteConfig.author.url,
    jobTitle: siteConfig.author.role,
    homeLocation: siteConfig.author.location,
    sameAs: siteConfig.author.socials.map((s) => s.href),
  };
}

export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleJsonLd(
  post: LocalizedPost,
  locale: Locale,
): Record<string, unknown> {
  const pageUrl = `${siteConfig.url}/blog/${post.slug}`;
  const ogImage = post.cover_image_url
    ? toAbsoluteAssetUrl(post.cover_image_url)
    : `${siteConfig.url}/blog/${post.slug}/opengraph-image`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': pageUrl,
    url: pageUrl,
    inLanguage: locale,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    image: ogImage,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icon.svg`,
      },
    },
    mainEntityOfPage: pageUrl,
    articleSection: categoryLabel(locale, post.category),
  };
}

export function buildPostBreadcrumbJsonLd(
  post: LocalizedPost,
  locale: Locale,
): Record<string, unknown> {
  const blogLabel = locale === 'es' ? 'Blog' : 'Blog';

  return buildBreadcrumbJsonLd([
    { name: siteConfig.name, url: siteConfig.url },
    { name: blogLabel, url: `${siteConfig.url}/blog` },
    {
      name: categoryLabel(locale, post.category),
      url: `${siteConfig.url}/categories/${post.category}`,
    },
    { name: post.title, url: `${siteConfig.url}/blog/${post.slug}` },
  ]);
}

import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/dictionary';
import type { LocalizedPost } from '@/lib/posts/types';
import { toAbsoluteAssetUrl } from './asset-url';
import { siteConfig } from './site';

export function buildPostMetadata(post: LocalizedPost, locale: Locale): Metadata {
  const description = post.excerpt.slice(0, 160);
  const ogImage = post.cover_image_url
    ? toAbsoluteAssetUrl(post.cover_image_url)
    : `${siteConfig.url}/blog/${post.slug}/opengraph-image`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
      languages: {
        en: `${siteConfig.url}/blog/${post.slug_en}`,
        es: `${siteConfig.url}/blog/${post.slug_es}`,
        'x-default': `${siteConfig.url}/blog/${post.slug_en}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export function buildArticleJsonLd(
  post: LocalizedPost,
  locale: Locale,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
    image: post.cover_image_url ? toAbsoluteAssetUrl(post.cover_image_url) : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };
}

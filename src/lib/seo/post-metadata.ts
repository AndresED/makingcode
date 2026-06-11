import type { Metadata } from 'next';
import type { PostDetail } from '@/lib/posts/types';
import { siteConfig } from './site';

export function buildPostMetadata(post: PostDetail): Metadata {
  const description = post.excerpt.slice(0, 160);
  const ogImage = post.cover_image_url ?? `${siteConfig.url}/opengraph-image`;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
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

export function buildArticleJsonLd(post: PostDetail): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    image: post.cover_image_url ?? undefined,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };
}

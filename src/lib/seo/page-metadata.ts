import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/dictionary';
import { formatSeriesName } from '@/lib/posts/format-series-name';
import { resolveSeriesDescription, type SeriesPresentationFields } from '@/lib/posts/series-presentation';
import { t } from '@/lib/i18n/dictionary';
import { categoryLabel } from '@/lib/i18n/category';
import { categoryDescription } from '@/lib/i18n/category-copy';
import type { PostCategory } from '@/lib/posts/categories';
import { siteConfig } from './site';
import { toAbsoluteAssetUrl } from './asset-url';

export function buildHomeMetadata(locale: Locale): Metadata {
  const title =
    locale === 'es'
      ? 'NestJS, AWS y arquitectura backend'
      : 'NestJS, AWS & Backend Architecture';

  return {
    title,
    description: t(locale, 'home.tagline'),
    alternates: { canonical: siteConfig.url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: t(locale, 'home.subtitle'),
      url: siteConfig.url,
    },
  };
}

export function buildBlogMetadata(
  locale: Locale,
  options?: { page?: number; totalPages?: number; query?: string },
): Metadata {
  const query = options?.query?.trim() ?? '';
  const page = options?.page ?? 1;
  const totalPages = options?.totalPages ?? 1;

  if (query.length >= 2) {
    return {
      title: t(locale, 'blog.results'),
      robots: { index: false, follow: false },
      alternates: { canonical: `${siteConfig.url}/blog` },
    };
  }

  const base: Metadata = {
    title: t(locale, 'blog.title'),
    description: t(locale, 'home.subtitle'),
    alternates: {
      canonical: page === 1 ? `${siteConfig.url}/blog` : `${siteConfig.url}/blog?page=${page}`,
    },
  };

  if (totalPages > 1) {
    base.pagination = {
      ...(page > 1 && {
        previous:
          page === 2
            ? `${siteConfig.url}/blog`
            : `${siteConfig.url}/blog?page=${page - 1}`,
      }),
      ...(page < totalPages && {
        next: `${siteConfig.url}/blog?page=${page + 1}`,
      }),
    };
  }

  return base;
}

export function buildAboutMetadata(locale: Locale): Metadata {
  return {
    title: t(locale, 'about.title'),
    description: t(locale, 'about.para3'),
    alternates: { canonical: `${siteConfig.url}/about` },
    openGraph: {
      title: `${t(locale, 'about.title')} | ${siteConfig.name}`,
      description: t(locale, 'about.para1'),
      url: `${siteConfig.url}/about`,
    },
  };
}

export function buildCategoryMetadata(
  locale: Locale,
  category: PostCategory,
  options?: { page?: number; totalPages?: number },
): Metadata {
  const label = categoryLabel(locale, category);
  const page = options?.page ?? 1;
  const totalPages = options?.totalPages ?? 1;
  const basePath = `/categories/${category}`;

  const description = categoryDescription(locale, category);

  const metadata: Metadata = {
    title: label,
    description,
    alternates: {
      canonical:
        page === 1
          ? `${siteConfig.url}${basePath}`
          : `${siteConfig.url}${basePath}?page=${page}`,
    },
  };

  if (totalPages > 1) {
    metadata.pagination = {
      ...(page > 1 && {
        previous:
          page === 2
            ? `${siteConfig.url}${basePath}`
            : `${siteConfig.url}${basePath}?page=${page - 1}`,
      }),
      ...(page < totalPages && {
        next: `${siteConfig.url}${basePath}?page=${page + 1}`,
      }),
    };
  }

  return metadata;
}

export function buildSeriesIndexMetadata(locale: Locale): Metadata {
  const title = locale === 'es' ? 'Series de artículos' : 'Article series';
  const description =
    locale === 'es'
      ? 'Series de artículos ordenados sobre NestJS, arquitectura backend y patrones en producción.'
      : 'Ordered article series on NestJS, backend architecture, and production patterns.';

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/series` },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/series`,
    },
  };
}

export function buildSeriesMetadata(
  locale: Locale,
  seriesSlug: string,
  articleCount: number,
  series?: (SeriesPresentationFields & { cover_image_url?: string | null }) | null,
): Metadata {
  const name = formatSeriesName(seriesSlug, locale, series);

  const description =
    series != null
      ? resolveSeriesDescription(locale, series)
      : locale === 'es'
        ? `Serie de ${articleCount} artículos: ${name}. Tutoriales y patrones NestJS en producción.`
        : `${articleCount}-article series: ${name}. NestJS patterns and production tutorials.`;

  const ogImage = series?.cover_image_url?.trim()
    ? toAbsoluteAssetUrl(series.cover_image_url.trim())
    : undefined;

  return {
    title: name,
    description,
    alternates: { canonical: `${siteConfig.url}/series/${seriesSlug}` },
    openGraph: {
      title: `${name} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/series/${seriesSlug}`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

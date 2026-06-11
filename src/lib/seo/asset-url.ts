import { siteConfig } from './site';

/** Turn `/images/foo.webp` or absolute URLs into a canonical absolute URL (OG, JSON-LD). */
export function toAbsoluteAssetUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (!value) return siteConfig.url;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${siteConfig.url}${value}`;
  }
  return `${siteConfig.url}/${value}`;
}

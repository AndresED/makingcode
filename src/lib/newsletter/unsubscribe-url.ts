import { siteConfig } from '@/lib/seo/site';

export function buildNewsletterUnsubscribeUrl(token: string): string {
  return `${siteConfig.url}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

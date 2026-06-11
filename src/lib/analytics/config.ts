export type AnalyticsProvider = 'plausible' | 'umami';

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  scriptSrc: string;
  domain?: string;
  websiteId?: string;
}

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  if (plausibleDomain) {
    return {
      provider: 'plausible',
      domain: plausibleDomain,
      scriptSrc:
        process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL?.trim() ??
        'https://plausible.io/js/script.js',
    };
  }

  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (umamiWebsiteId) {
    const scriptSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
    if (!scriptSrc) return null;
    return {
      provider: 'umami',
      websiteId: umamiWebsiteId,
      scriptSrc,
    };
  }

  return null;
}

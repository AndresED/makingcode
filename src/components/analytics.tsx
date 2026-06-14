import Script from 'next/script';
import { AnalyticsBeacon } from '@/components/analytics-beacon';
import { getAnalyticsConfig } from '@/lib/analytics/config';

function ThirdPartyAnalytics() {
  const config = getAnalyticsConfig();
  if (!config) return null;

  if (config.provider === 'plausible' && config.domain) {
    return (
      <Script
        defer
        data-domain={config.domain}
        src={config.scriptSrc}
        strategy="afterInteractive"
      />
    );
  }

  if (config.provider === 'umami' && config.websiteId) {
    return (
      <Script
        defer
        src={config.scriptSrc}
        data-website-id={config.websiteId}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}

export function Analytics() {
  return (
    <>
      <AnalyticsBeacon />
      <ThirdPartyAnalytics />
    </>
  );
}

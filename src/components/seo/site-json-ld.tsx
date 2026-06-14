import { buildWebSiteJsonLd } from '@/lib/seo/json-ld';

export function SiteJsonLd() {
  const jsonLd = buildWebSiteJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

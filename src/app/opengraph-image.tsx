import { ImageResponse } from 'next/og';
import { brandColors } from '@/lib/brand/tokens';
import { siteConfig } from '@/lib/seo/site';

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '72px 80px',
          background: brandColors.dark900,
          color: brandColors.ink,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <svg width="52" height="62" viewBox="0 0 20 24" fill="none">
            <rect x="1" y="2" width="2.75" height="20" rx="1.25" fill={brandColors.accent500} />
            <rect
              x="6.5"
              y="3.5"
              width="12"
              height="1.75"
              rx="0.875"
              fill={brandColors.ink}
              fillOpacity="0.92"
            />
            <rect
              x="6.5"
              y="9"
              width="9"
              height="1.75"
              rx="0.875"
              fill={brandColors.ink}
              fillOpacity="0.58"
            />
            <rect
              x="6.5"
              y="14.5"
              width="6"
              height="1.75"
              rx="0.875"
              fill={brandColors.meta500}
              fillOpacity="0.9"
            />
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em' }}>Making</span>
            <span
              style={{
                fontSize: 38,
                fontWeight: 500,
                letterSpacing: '-0.04em',
                color: brandColors.meta500,
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              code
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              maxWidth: 920,
              color: brandColors.ink,
            }}
          >
            {siteConfig.description}
          </div>
          <div style={{ fontSize: 22, color: brandColors.accent400, marginTop: 32 }}>
            makingcode.dev
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

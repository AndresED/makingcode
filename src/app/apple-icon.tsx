import { ImageResponse } from 'next/og';
import { brandColors } from '@/lib/brand/tokens';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: brandColors.dark900,
        }}
      >
        <svg width="96" height="112" viewBox="0 0 20 24" fill="none">
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
          <rect
            x="6.5"
            y="20"
            width="3.25"
            height="1.75"
            rx="0.875"
            fill={brandColors.accent400}
            fillOpacity="0.75"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

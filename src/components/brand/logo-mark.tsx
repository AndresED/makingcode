import { brandColors } from '@/lib/brand/tokens';

interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
}

/**
 * Ledger mark — accent rule + descending lines (editorial margin + code rhythm).
 * No app-icon container; reads at 16px favicon and header scale.
 */
export function LogoMark({
  size = 24,
  className,
  title = 'Making Code',
  'aria-hidden': ariaHidden,
}: LogoMarkProps) {
  const height = size;
  const width = Math.round(size * (20 / 24));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : title}
    >
      {!ariaHidden ? <title>{title}</title> : null}
      <rect x="1" y="2" width="2.75" height="20" rx="1.25" fill={brandColors.accent500} />
      <rect x="6.5" y="3.5" width="12" height="1.75" rx="0.875" fill={brandColors.ink} fillOpacity="0.92" />
      <rect x="6.5" y="9" width="9" height="1.75" rx="0.875" fill={brandColors.ink} fillOpacity="0.58" />
      <rect x="6.5" y="14.5" width="6" height="1.75" rx="0.875" fill={brandColors.meta500} fillOpacity="0.9" />
      <rect x="6.5" y="20" width="3.25" height="1.75" rx="0.875" fill={brandColors.accent400} fillOpacity="0.75" />
    </svg>
  );
}

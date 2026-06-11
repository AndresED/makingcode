import { LogoMark } from '@/components/brand/logo-mark';

interface LogoProps {
  showWordmark?: boolean;
  markSize?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const wordmarkSize = {
  sm: 'text-[0.95rem]',
  md: 'text-base',
  lg: 'text-lg',
  hero: 'text-4xl sm:text-5xl lg:text-[3.25rem]',
} as const;

export function BrandWordmark({ size = 'md', className }: { size?: keyof typeof wordmarkSize; className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.28em] leading-none ${wordmarkSize[size]} ${className ?? ''}`}
    >
      <span className="font-display font-semibold tracking-[-0.03em] text-ink">Making</span>
      <span className="font-mono text-[0.9em] font-medium tracking-[-0.04em] text-meta-400">code</span>
    </span>
  );
}

/**
 * Typographic lockup: editorial "Making" + mono "code" — dual voice of the blog.
 */
export function Logo({
  showWordmark = true,
  markSize = 24,
  className,
  size = 'md',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ''}`}>
      <LogoMark size={markSize} aria-hidden={showWordmark || undefined} />
      {showWordmark ? <BrandWordmark size={size} /> : null}
    </span>
  );
}

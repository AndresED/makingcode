import type { PostCategory } from './categories';

export interface CoverFallbackStyle {
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  accent: string;
  glyph: string;
}

const CATEGORY_STYLES: Record<PostCategory, Omit<CoverFallbackStyle, 'glyph'>> = {
  backend: {
    gradientFrom: 'from-accent-500/25',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-meta-500/15',
    accent: 'text-accent-400',
  },
  cloud: {
    gradientFrom: 'from-meta-500/30',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-accent-500/10',
    accent: 'text-meta-400',
  },
  architecture: {
    gradientFrom: 'from-meta-400/20',
    gradientVia: 'via-dark-700',
    gradientTo: 'to-accent-500/15',
    accent: 'text-meta-400',
  },
  algorithms: {
    gradientFrom: 'from-accent-600/25',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-meta-500/10',
    accent: 'text-accent-400',
  },
  security: {
    gradientFrom: 'from-red-500/15',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-meta-500/10',
    accent: 'text-red-300/80',
  },
  ai: {
    gradientFrom: 'from-violet-500/20',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-meta-500/15',
    accent: 'text-violet-300/80',
  },
  devops: {
    gradientFrom: 'from-emerald-500/15',
    gradientVia: 'via-dark-800',
    gradientTo: 'to-meta-500/10',
    accent: 'text-emerald-300/80',
  },
};

export function getCoverFallbackStyle(category: PostCategory, title: string): CoverFallbackStyle {
  const base = CATEGORY_STYLES[category];
  const glyph = title.trim().charAt(0).toUpperCase() || 'M';
  return { ...base, glyph };
}

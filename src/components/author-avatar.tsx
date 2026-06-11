import Image from 'next/image';
import { siteConfig } from '@/lib/seo/site';

const AVATAR_PATH = '/images/andres-esquivel.jpg';

interface AuthorAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  sm: { box: 'size-12', px: 48 },
  md: { box: 'size-16', px: 64 },
  lg: { box: 'size-24', px: 96 },
} as const;

export function AuthorAvatar({ size = 'md', className = '', priority }: AuthorAvatarProps) {
  const { box, px } = sizeMap[size];

  return (
    <Image
      src={AVATAR_PATH}
      alt={siteConfig.author.name}
      width={px}
      height={px}
      priority={priority}
      className={`${box} shrink-0 rounded-2xl object-cover ring-1 ring-white/[0.08] ${className}`}
    />
  );
}

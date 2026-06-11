import Image from 'next/image';

interface PostCoverImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const OPTIMIZED_HOST_PATTERN = /\.supabase\.(co|in)$/;

function isOptimizableHost(hostname: string): boolean {
  return OPTIMIZED_HOST_PATTERN.test(hostname);
}

export function PostCoverImage({
  src,
  alt,
  className = 'object-cover',
  priority = false,
  sizes = '100vw',
}: PostCoverImageProps) {
  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  let hostname = '';
  try {
    hostname = new URL(src).hostname;
  } catch {
    return null;
  }

  if (isOptimizableHost(hostname)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    // External URLs: admin-controlled; skip next/image domain allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 h-full w-full ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

/** Canonical public URL — always prefer www on production apex. */
export function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeSiteUrl(configured);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/\/$/, '').replace(/^https?:\/\//, '');
    if (host === 'makingcode.dev') {
      return 'https://www.makingcode.dev';
    }
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}

function normalizeSiteUrl(url: string): string {
  const trimmed = url.replace(/\/$/, '');
  if (trimmed === 'https://makingcode.dev') {
    return 'https://www.makingcode.dev';
  }
  return trimmed;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = resolveSiteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

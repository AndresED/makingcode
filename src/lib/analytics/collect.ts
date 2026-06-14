const BOT_PATTERN =
  /bot|crawler|spider|slurp|facebookexternalhit|headless|lighthouse|preview|wget|curl|python-requests|go-http-client|bytespider|petalbot/i;

const BLOCKED_PREFIXES = ['/dashboard', '/login', '/api/'];

export function isAnalyticsBot(userAgent: string | null): boolean {
  if (!userAgent?.trim()) return true;
  return BOT_PATTERN.test(userAgent);
}

export function isTrackablePath(path: string): boolean {
  const normalized = path.trim();
  if (!normalized.startsWith('/')) return false;
  if (BLOCKED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
  if (normalized.startsWith('/blog?')) return false;
  return true;
}

export function referrerHostFromHeader(referer: string | null): string | null {
  if (!referer?.trim()) return null;
  try {
    const host = new URL(referer).hostname.toLowerCase();
    return host || null;
  } catch {
    return null;
  }
}

export function normalizeCountryCode(value: string | null): string | null {
  const code = value?.trim().toUpperCase();
  if (!code || code.length !== 2) return null;
  return code;
}

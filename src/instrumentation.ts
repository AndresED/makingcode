/** Prefer IPv4 on Windows — avoids intermittent `fetch failed` to Supabase. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}

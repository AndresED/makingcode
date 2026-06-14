'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'mc_analytics_sid';

function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

function detectLocale(pathname: string): 'en' | 'es' | undefined {
  if (pathname.startsWith('/es')) return 'es';
  return undefined;
}

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    const sessionId = getSessionId();
    const locale = detectLocale(pathname);

    void fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        sessionId,
        ...(locale ? { locale } : {}),
      }),
      keepalive: true,
    });
  }, [pathname]);

  return null;
}

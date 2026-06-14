import { z } from 'zod';
import {
  isAnalyticsBot,
  isTrackablePath,
  normalizeCountryCode,
  referrerHostFromHeader,
} from '@/lib/analytics/collect';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  path: z.string().min(1).max(500),
  sessionId: z.string().uuid(),
  locale: z.enum(['en', 'es']).optional(),
});

export async function POST(request: Request) {
  if (isAnalyticsBot(request.headers.get('user-agent'))) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success || !isTrackablePath(parsed.data.path)) {
    return new Response(null, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase.rpc('record_page_view', {
    p_path: parsed.data.path,
    p_session_id: parsed.data.sessionId,
    p_referrer_host: referrerHostFromHeader(request.headers.get('referer')),
    p_country_code: normalizeCountryCode(request.headers.get('x-vercel-ip-country')),
    p_locale: parsed.data.locale ?? null,
  });

  if (error) {
    return new Response(null, { status: 503 });
  }

  return new Response(null, { status: 204 });
}

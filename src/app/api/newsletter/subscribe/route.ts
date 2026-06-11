import { NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/newsletter/subscribe';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const result = await subscribeToNewsletter(body);

  if (!result.ok) {
    const status =
      result.error === 'invalid_email'
        ? 400
        : result.error === 'not_configured'
          ? 503
          : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    status: result.status,
    unsubscribe_token: result.unsubscribe_token,
  });
}

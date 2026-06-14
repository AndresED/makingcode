import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const headers = new Headers(response.headers);
  headers.set('x-pathname', request.nextUrl.pathname);
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

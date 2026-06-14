import { getLocale } from '@/lib/i18n/locale';
import { searchPublishedContent } from '@/lib/posts/search';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const locale = await getLocale();
  const { posts, series } = await searchPublishedContent(q, locale, 15);

  return Response.json({ posts, series });
}

import { getAdminSession } from '@/lib/auth/session';
import { markdownToHtml } from '@/lib/markdown/render';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { markdown?: string };
  const markdown = body.markdown ?? '';

  if (markdown.length > 100_000) {
    return Response.json({ error: 'Content too large' }, { status: 400 });
  }

  const html = await markdownToHtml(markdown);
  return Response.json({ html });
}

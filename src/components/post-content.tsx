import { markdownToHtml } from '@/lib/markdown/render';

interface PostContentProps {
  bodyHtml: string;
  bodyMd: string;
}

export async function PostContent({ bodyHtml, bodyMd }: PostContentProps) {
  const html = bodyHtml.trim() ? bodyHtml : await markdownToHtml(bodyMd);

  return (
    <div
      className="post-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

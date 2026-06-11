import { markdownToHtml } from '@/lib/markdown/render';

interface PostContentProps {
  bodyMd: string;
}

export async function PostContent({ bodyMd }: PostContentProps) {
  const html = await markdownToHtml(bodyMd);

  return (
    <div
      className="post-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

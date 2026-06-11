import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(rehypeSlug)
  .use(rehypeSanitize)
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

export function markdownToHtmlSync(markdown: string): string {
  const file = processor.processSync(markdown);
  return String(file);
}

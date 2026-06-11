import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code';

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    pre: [...(defaultSchema.attributes?.pre ?? []), ['className'], ['dataLanguage'], ['tabIndex']],
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ['className'],
      ['dataLanguage'],
      ['dataLineNumbers'],
    ],
    span: [...(defaultSchema.attributes?.span ?? []), ['className'], ['style'], ['dataLine']],
    div: [...(defaultSchema.attributes?.div ?? []), ['className'], ['dataRehypePrettyCodeTitle']],
  },
};

const prettyCodeOptions: PrettyCodeOptions = {
  theme: 'github-dark-dimmed',
  keepBackground: false,
  defaultLang: 'plaintext',
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypePrettyCode, prettyCodeOptions)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

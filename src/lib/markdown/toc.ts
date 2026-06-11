import { slugify } from '@/lib/posts/utils';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractTocFromMarkdown(markdown: string): TocItem[] {
  const items: TocItem[] = [];

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2]
      .replace(/\*\*|__|\*|_|`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!text) continue;

    items.push({ id: slugify(text), text, level });
  }

  return items;
}

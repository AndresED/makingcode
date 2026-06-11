import type { PostCategory } from '@/lib/posts/categories';
import { t, type DictionaryKey, type Locale } from './dictionary';

export function categoryLabel(locale: Locale, category: PostCategory): string {
  return t(locale, `category.${category}` as DictionaryKey);
}

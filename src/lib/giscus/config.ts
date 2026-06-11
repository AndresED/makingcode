export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  strict: boolean;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: 'top' | 'bottom';
  theme: string;
  lang: 'en' | 'es';
}

export function getGiscusConfig(locale: 'en' | 'es'): GiscusConfig | null {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO?.trim();
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID?.trim();
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY?.trim();
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID?.trim();

  if (!repo || !repoId || !category || !categoryId) {
    return null;
  }

  return {
    repo,
    repoId,
    category,
    categoryId,
    mapping: 'pathname',
    strict: true,
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'top',
    theme: 'noborder_dark',
    lang: locale,
  };
}

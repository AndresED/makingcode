import { createClient } from '@/lib/supabase/server';
import { isValidSlug, slugify } from './utils';

export async function resolveUniqueSlugs(
  titleEn: string,
  titleEs: string,
  excludePostId?: string,
): Promise<{ slug_en: string; slug_es: string; error?: string }> {
  const baseEn = slugify(titleEn);
  const baseEs = slugify(titleEs);

  if (!isValidSlug(baseEn) || !isValidSlug(baseEs)) {
    return { slug_en: baseEn, slug_es: baseEs, error: 'Invalid slug generated from title' };
  }

  const supabase = await createClient();
  let query = supabase.from('posts').select('id, slug_en, slug_es');
  if (excludePostId) {
    query = query.neq('id', excludePostId);
  }
  const { data, error } = await query;
  if (error) {
    return { slug_en: baseEn, slug_es: baseEs, error: error.message };
  }

  const takenEn = new Set((data ?? []).map((r) => r.slug_en));
  const takenEs = new Set((data ?? []).map((r) => r.slug_es));

  return {
    slug_en: pickUnique(baseEn, takenEn),
    slug_es: pickUnique(baseEs, takenEs),
  };
}

function pickUnique(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

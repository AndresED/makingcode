/**
 * Patch production posts: series_slug, series_order, staggered published_at.
 *
 * Usage:
 *   npm run patch:seo
 *   npm run patch:seo -- --dry-run
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SERIES_SLUG = 'nestjs-enterprise';

/** Published conceptual articles currently live on makingcode.dev */
const PATCHES = [
  {
    slug_en: 'why-your-nestjs-service-becomes-a-mess-and-how-hexagonal-architecture-fixes-it',
    series_order: 1,
    published_at: '2026-03-10T14:00:00.000Z',
  },
  {
    slug_en: 'cqrs-in-nestjs-stop-mixing-reads-and-writes-in-the-same-service',
    series_order: 2,
    published_at: '2026-03-24T14:00:00.000Z',
  },
  {
    slug_en: 'your-api-doesn-t-need-more-services-it-needs-events',
    series_order: 3,
    published_at: '2026-04-07T14:00:00.000Z',
  },
  {
    slug_en: 'how-to-build-a-multi-tenant-saas-application-in-nestjs-without-duplicating-your-code',
    series_order: 4,
    published_at: '2026-04-21T14:00:00.000Z',
  },
];

function loadEnvLocal() {
  const path = join(root, '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dryRun = process.argv.includes('--dry-run');

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Patching ${PATCHES.length} post(s) → series ${SERIES_SLUG}${dryRun ? ' [DRY RUN]' : ''}…\n`);

  for (const patch of PATCHES) {
    const { data: existing, error: findError } = await supabase
      .from('posts')
      .select('id, slug_en, series_slug, series_order, published_at')
      .eq('slug_en', patch.slug_en)
      .maybeSingle();

    if (findError) {
      console.error(`✗ ${patch.slug_en}: ${findError.message}`);
      continue;
    }

    if (!existing) {
      console.warn(`⊘ ${patch.slug_en}: not found in DB`);
      continue;
    }

    const row = {
      series_slug: SERIES_SLUG,
      series_order: patch.series_order,
      published_at: patch.published_at,
    };

    if (dryRun) {
      console.log(
        `[dry-run] ${patch.slug_en} → order=${patch.series_order} published_at=${patch.published_at}`,
      );
      continue;
    }

    const { error } = await supabase.from('posts').update(row).eq('id', existing.id);
    console.log(
      error
        ? `✗ ${patch.slug_en}: ${error.message}`
        : `✓ ${patch.slug_en} → /series/${SERIES_SLUG} #${patch.series_order}`,
    );
  }

  console.log('\nDone. Revalidate /series/nestjs-enterprise and sitemap after deploy.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

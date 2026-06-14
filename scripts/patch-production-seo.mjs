/**
 * Patch production posts: series, dates, and cover images.
 *
 * Usage:
 *   npm run patch:seo
 *   npm run patch:seo -- --dry-run
 *   npm run patch:seo -- --covers-only
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SERIES_SLUG = 'nestjs-enterprise';
const SERIES_TITLES = { title_en: 'NestJS Enterprise', title_es: 'NestJS Enterprise' };

/** Published conceptual articles currently live on makingcode.dev */
const PATCHES = [
  {
    slug_en: 'why-your-nestjs-service-becomes-a-mess-and-how-hexagonal-architecture-fixes-it',
    series_order: 1,
    published_at: '2026-03-10T14:00:00.000Z',
    cover_image_url: '/images/hexagonal.webp',
  },
  {
    slug_en: 'cqrs-in-nestjs-stop-mixing-reads-and-writes-in-the-same-service',
    series_order: 2,
    published_at: '2026-03-24T14:00:00.000Z',
    cover_image_url: '/images/cqrs.webp',
  },
  {
    slug_en: 'your-api-doesn-t-need-more-services-it-needs-events',
    series_order: 3,
    published_at: '2026-04-07T14:00:00.000Z',
    cover_image_url: '/images/event-drive.webp',
  },
  {
    slug_en: 'how-to-build-a-multi-tenant-saas-application-in-nestjs-without-duplicating-your-code',
    series_order: 4,
    published_at: '2026-04-21T14:00:00.000Z',
    cover_image_url: '/images/multitenant.webp',
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

async function ensureSeries(supabase, dryRun) {
  const row = { slug: SERIES_SLUG, ...SERIES_TITLES };
  if (dryRun) {
    console.log(`[dry-run] upsert post_series → ${JSON.stringify(row)}`);
    return { id: 'dry-run-series-id' };
  }

  const { data, error } = await supabase
    .from('post_series')
    .upsert(row, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

async function assignSeriesMember(supabase, seriesId, postId, position, dryRun) {
  const member = { series_id: seriesId, post_id: postId, position };
  if (dryRun) {
    console.log(`[dry-run] upsert post_series_members → ${JSON.stringify(member)}`);
    return;
  }

  const { error } = await supabase
    .from('post_series_members')
    .upsert(member, { onConflict: 'post_id' });

  if (error) throw error;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dryRun = process.argv.includes('--dry-run');
  const coversOnly = process.argv.includes('--covers-only');

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(
    `Patching ${PATCHES.length} post(s)${coversOnly ? ' (covers only)' : ''}${dryRun ? ' [DRY RUN]' : ''}…\n`,
  );

  const series = coversOnly ? null : await ensureSeries(supabase, dryRun);

  for (const patch of PATCHES) {
    const { data: existing, error: findError } = await supabase
      .from('posts')
      .select('id, slug_en, cover_image_url')
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

    const row = coversOnly
      ? { cover_image_url: patch.cover_image_url }
      : {
          published_at: patch.published_at,
          cover_image_url: patch.cover_image_url,
        };

    if (dryRun) {
      console.log(`[dry-run] ${patch.slug_en} posts → ${JSON.stringify(row)}`);
      if (!coversOnly && series) {
        await assignSeriesMember(supabase, series.id, existing.id, patch.series_order, true);
      }
      continue;
    }

    const { error } = await supabase.from('posts').update(row).eq('id', existing.id);
    if (error) {
      console.error(`✗ ${patch.slug_en}: ${error.message}`);
      continue;
    }

    if (!coversOnly && series) {
      try {
        await assignSeriesMember(supabase, series.id, existing.id, patch.series_order, false);
      } catch (memberError) {
        console.error(
          `✗ ${patch.slug_en} series member: ${memberError instanceof Error ? memberError.message : memberError}`,
        );
        continue;
      }
    }

    console.log(`✓ ${patch.slug_en}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Seed tutorial posts from docs/samples/nestjs-enterprise/ into Supabase.
 *
 * Usage:
 *   npm run seed:posts
 *   npm run seed:posts -- --dry-run
 *   npm run seed:posts -- --slug building-hexagonal-module-nestjs
 *   npm run seed:posts -- --covers-only   # only update cover_image_url + series
 *
 * Cover images: place files in public/images/ and set coverImage in posts.manifest.json
 * (e.g. "/images/hexagonal.webp").
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const samplesDir = join(root, 'docs', 'samples', 'nestjs-enterprise');

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

function estimateReadingTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function excerptFromMarkdown(markdown, max = 300) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

function slugifyEs(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

async function renderMarkdown(markdown) {
  const { markdownToHtml } = await import('../src/lib/markdown/render.ts');
  return markdownToHtml(markdown);
}

function resolveCoverImage(entry) {
  const value = entry.coverImage ?? entry.cover_image_url ?? null;
  if (!value) return null;
  if (value.startsWith('/') || value.startsWith('http')) return value;
  return `/images/${value}`;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'andres30xed@gmail.com';
  const dryRun = process.argv.includes('--dry-run');
  const coversOnly = process.argv.includes('--covers-only');
  const slugFilter = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]
    ?? (process.argv.includes('--slug') ? process.argv[process.argv.indexOf('--slug') + 1] : null);

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const manifest = JSON.parse(
    readFileSync(join(samplesDir, 'posts.manifest.json'), 'utf8'),
  );

  const posts = slugFilter
    ? manifest.filter((p) => p.slug === slugFilter)
    : manifest;

  if (posts.length === 0) {
    console.error(slugFilter ? `No post found for slug: ${slugFilter}` : 'Empty manifest');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Failed to list users:', usersError.message);
    process.exit(1);
  }

  const author = usersData.users.find((u) => u.email === adminEmail);
  if (!author) {
    console.error(`Admin user not found: ${adminEmail}`);
    process.exit(1);
  }

  console.log(`Author: ${author.email} (${author.id})`);
  console.log(
    `${coversOnly ? 'Updating covers/series' : 'Seeding'} ${posts.length} post(s)${dryRun ? ' [DRY RUN]' : ''}…\n`,
  );

  for (const entry of posts) {
    const cover_image_url = resolveCoverImage(entry);
    const series_slug = entry.series_slug ?? null;
    const series_order = entry.series_order ?? null;

    const { data: existing } = await supabase
      .from('posts')
      .select('id, slug_en')
      .eq('slug_en', entry.slug)
      .maybeSingle();

    if (coversOnly) {
      if (!existing) {
        console.warn(`⊘ ${entry.slug}: post not found in DB (run full seed first)`);
        continue;
      }

      const patch = {
        cover_image_url,
        series_slug,
        series_order,
      };

      if (dryRun) {
        console.log(`[dry-run] PATCH ${entry.slug} cover=${cover_image_url ?? '—'}`);
        continue;
      }

      const { error } = await supabase.from('posts').update(patch).eq('id', existing.id);
      console.log(error ? `✗ ${entry.slug}: ${error.message}` : `✓ Covers/series ${entry.slug}`);
      continue;
    }

    const bodyPath = join(samplesDir, entry.bodyFile);
    if (!existsSync(bodyPath)) {
      console.error(`Missing body file: ${entry.bodyFile}`);
      continue;
    }

    const body_md_en = readFileSync(bodyPath, 'utf8');
    const excerpt_en = entry.excerpt || excerptFromMarkdown(body_md_en);
    const body_html_en = await renderMarkdown(body_md_en);
    const body_html_es = body_html_en;
    const reading_time_minutes = estimateReadingTime(body_md_en);

    const title_en = entry.title;
    const title_es = entry.title_es ?? title_en;
    const slug_en = entry.slug;
    const slug_es = entry.slug_es ?? `${slugifyEs(title_es)}-es`;

    const row = {
      title_en,
      title_es,
      slug_en,
      slug_es,
      excerpt_en,
      excerpt_es: entry.excerpt_es ?? excerpt_en,
      body_md_en,
      body_md_es: entry.bodyFileEs ? readFileSync(join(samplesDir, entry.bodyFileEs), 'utf8') : body_md_en,
      body_html_en,
      body_html_es: entry.bodyFileEs
        ? await renderMarkdown(readFileSync(join(samplesDir, entry.bodyFileEs), 'utf8'))
        : body_html_es,
      category: entry.category,
      cover_image_url,
      series_slug,
      series_order,
      reading_time_minutes,
      status: 'published',
      published_at: new Date().toISOString(),
      author_id: author.id,
    };

    if (dryRun) {
      console.log(
        `[dry-run] ${existing ? 'UPDATE' : 'INSERT'} ${slug_en} cover=${cover_image_url ?? 'fallback'} series=${series_slug ?? '—'}`,
      );
      continue;
    }

    if (existing) {
      const { error } = await supabase.from('posts').update(row).eq('id', existing.id);
      console.log(error ? `✗ ${entry.slug}: ${error.message}` : `✓ Updated /blog/${slug_en}`);
    } else {
      const { error } = await supabase.from('posts').insert(row);
      console.log(error ? `✗ ${entry.slug}: ${error.message}` : `✓ Published /blog/${slug_en}`);
    }
  }

  console.log('\nDone. Covers live under public/images → /images/*.webp on the site.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Seed tutorial posts from docs/samples/nestjs-enterprise/ into Supabase.
 *
 * Usage:
 *   node scripts/seed-blog-posts.mjs
 *   node scripts/seed-blog-posts.mjs --dry-run
 *   node scripts/seed-blog-posts.mjs --slug building-hexagonal-module-nestjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional: ADMIN_EMAIL (default andres30xed@gmail.com) for author_id
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

async function markdownToHtml(markdown) {
  const { markdownToHtmlSync } = await import('../src/lib/markdown/render.ts');
  return markdownToHtmlSync(markdown);
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'andres30xed@gmail.com';
  const dryRun = process.argv.includes('--dry-run');
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
  console.log(`Seeding ${posts.length} post(s)${dryRun ? ' [DRY RUN]' : ''}…\n`);

  for (const entry of posts) {
    const bodyPath = join(samplesDir, entry.bodyFile);
    if (!existsSync(bodyPath)) {
      console.error(`Missing body file: ${entry.bodyFile}`);
      continue;
    }

    const body_md = readFileSync(bodyPath, 'utf8');
    const excerpt = entry.excerpt || excerptFromMarkdown(body_md);
    const body_html = await markdownToHtml(body_md);
    const reading_time_minutes = estimateReadingTime(body_md);

    const row = {
      title: entry.title,
      slug: entry.slug,
      excerpt,
      body_md,
      body_html,
      category: entry.category,
      cover_image_url: entry.cover_image_url ?? null,
      reading_time_minutes,
      status: 'published',
      published_at: new Date().toISOString(),
      author_id: author.id,
      locale: 'en',
    };

    const { data: existing } = await supabase
      .from('posts')
      .select('id, slug')
      .eq('slug', entry.slug)
      .maybeSingle();

    if (dryRun) {
      console.log(`[dry-run] ${existing ? 'UPDATE' : 'INSERT'} ${entry.slug} (${reading_time_minutes} min)`);
      continue;
    }

    if (existing) {
      const { error } = await supabase.from('posts').update(row).eq('id', existing.id);
      if (error) {
        console.error(`✗ ${entry.slug}: ${error.message}`);
      } else {
        console.log(`✓ Updated /blog/${entry.slug}`);
      }
    } else {
      const { error } = await supabase.from('posts').insert(row);
      if (error) {
        console.error(`✗ ${entry.slug}: ${error.message}`);
      } else {
        console.log(`✓ Published /blog/${entry.slug}`);
      }
    }
  }

  console.log('\nDone. Restart dev server or wait for revalidate if pages are cached.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

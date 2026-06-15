/**
 * Seed bilingual posts from docs/publicaciones (paired en.md + es.md per folder).
 *
 * Usage: npm run seed:publicaciones
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicacionesDir = join(root, 'docs', 'publicaciones');

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

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content.trim() };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return { meta, body: match[2].trim() };
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function estimateReadingTime(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function excerptFromMarkdown(md, max = 300) {
  const plain = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

async function renderMarkdown(markdown) {
  const { markdownToHtml } = await import('../src/lib/markdown/render.ts');
  return markdownToHtml(markdown);
}

function staggeredPublishedAt(index, baseIso = '2026-03-01T12:00:00.000Z') {
  const base = new Date(baseIso).getTime();
  const daysBetween = 14;
  return new Date(base + index * daysBetween * 24 * 60 * 60 * 1000).toISOString();
}
function listTopicDirs() {
  return readdirSync(publicacionesDir).filter((entry) => {
    const full = join(publicacionesDir, entry);
    return statSync(full).isDirectory();
  });
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'andres30xed@gmail.com';
  const dryRun = process.argv.includes('--dry-run');

  if (!url || !serviceKey) {
    console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error(usersError.message);
    process.exit(1);
  }

  const author = usersData.users.find((u) => u.email === adminEmail);
  if (!author) {
    console.error(`Usuario admin no encontrado: ${adminEmail}`);
    process.exit(1);
  }

  const topics = listTopicDirs();
  console.log(`Publicando ${topics.length} artículos bilingües${dryRun ? ' [DRY RUN]' : ''}…\n`);

  for (const topic of topics) {
    const topicIndex = topics.indexOf(topic);
    const enPath = join(publicacionesDir, topic, 'en.md');
    const esPath = join(publicacionesDir, topic, 'es.md');
    if (!existsSync(enPath) || !existsSync(esPath)) {
      console.warn(`⊘ ${topic}: falta en.md o es.md`);
      continue;
    }

    const en = parseFrontmatter(readFileSync(enPath, 'utf8'));
    const es = parseFrontmatter(readFileSync(esPath, 'utf8'));

    const title_en = en.meta.title;
    const title_es = es.meta.title;
    const slug_en = en.meta.slug || slugify(title_en);
    const slug_es = es.meta.slug || slugify(title_es);
    const category = en.meta.category || es.meta.category || 'backend';
    const series_slug = en.meta.series_slug || es.meta.series_slug || null;
    const series_order = Number(en.meta.series_order || es.meta.series_order || 0) || null;
    const seriesTitle =
      en.meta.series_title_en || es.meta.series_title_en
        ? {
            title_en: en.meta.series_title_en || es.meta.series_title_en,
            title_es: en.meta.series_title_es || es.meta.series_title_es || en.meta.series_title_en,
          }
        : null;
    const seriesDescription =
      en.meta.series_description_en || es.meta.series_description_en
        ? {
            description_en: en.meta.series_description_en || es.meta.series_description_en,
            description_es: es.meta.series_description_es || en.meta.series_description_es,
          }
        : null;
    const published_at =
      en.meta.published_at ||
      es.meta.published_at ||
      (series_order != null ? staggeredPublishedAt(series_order - 1) : staggeredPublishedAt(topicIndex));

    const body_html_en = await renderMarkdown(en.body);
    const body_html_es = await renderMarkdown(es.body);

    const row = {
      title_en,
      title_es,
      slug_en,
      slug_es,
      excerpt_en: en.meta.excerpt || excerptFromMarkdown(en.body),
      excerpt_es: es.meta.excerpt || excerptFromMarkdown(es.body),
      body_md_en: en.body,
      body_md_es: es.body,
      body_html_en,
      body_html_es,
      category,
      cover_image_url: en.meta.cover_image_url || null,
      reading_time_minutes: Math.max(estimateReadingTime(en.body), estimateReadingTime(es.body)),
      status: 'published',
      published_at,
      author_id: author.id,
    };

    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .or(`slug_en.eq.${slug_en},slug_es.eq.${slug_es}`)
      .maybeSingle();

    if (dryRun) {
      console.log(`[dry-run] ${existing ? 'UPDATE' : 'INSERT'} ${slug_en} / ${slug_es}`);
      continue;
    }

    if (existing) {
      const { error } = await supabase.from('posts').update(row).eq('id', existing.id);
      if (error) {
        console.log(`✗ ${topic}: ${error.message}`);
        continue;
      }
      if (series_slug && series_order != null) {
        const { upsertSeriesMembership } = await import('./lib/post-series.mjs');
        await upsertSeriesMembership(supabase, {
          seriesSlug: series_slug,
          seriesOrder: series_order,
          postId: existing.id,
          seriesTitle,
          seriesDescription,
        });
      }
      console.log(`✓ Actualizado ${slug_en}`);
    } else {
      const { data: inserted, error } = await supabase.from('posts').insert(row).select('id').single();
      if (error) {
        console.log(`✗ ${topic}: ${error.message}`);
        continue;
      }
      if (series_slug && series_order != null && inserted?.id) {
        const { upsertSeriesMembership } = await import('./lib/post-series.mjs');
        await upsertSeriesMembership(supabase, {
          seriesSlug: series_slug,
          seriesOrder: series_order,
          postId: inserted.id,
          seriesTitle,
          seriesDescription,
        });
      }
      console.log(`✓ Publicado ${slug_en} + ${slug_es}`);
    }
  }

  console.log('\nListo.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

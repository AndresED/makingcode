# Spec — Blog / Posts

| Campo | Valor |
|-------|--------|
| **Código** | `app/(public)/blog/`, `app/(admin)/dashboard/`, `lib/posts/` |
| **Requerimientos** | [E1, E2](../../02-requerimientos/README.md) |
| **Última revisión** | 2026-06-10 |
| **Estado** | Aprobada |

## 1. Propósito

Gestionar y mostrar artículos técnicos en markdown con URLs amigables, estados de publicación y lectura optimizada para SEO.

## 2. Alcance

### Incluye (v1)

- CRUD posts (admin).
- Render markdown → HTML seguro.
- Slug único, generado desde título con edición manual.
- **Categoría fija** (enum — ver §3.1); obligatoria en cada post.
- Contenido en **inglés** (título, excerpt, body).
- `excerpt` para listados y meta description.
- `cover_image_url` opcional (Supabase Storage).
- `reading_time_minutes` calculado al guardar (~200 wpm).
- `published_at` al publicar; `updated_at` en cada save.
- Listado paginado + filtro por categoría (`/categories/[category]`).
- RSS en `/api/feed`.
- **Blog vacío al lanzar** — sin seed de posts legados.

### Excluye (v1)

- Tags libres / taxonomía custom.
- Series / colecciones.
- Comentarios.
- Posts en español u otros idiomas.
- Migración desde Blogger.
- Versionado de borradores (solo última versión).
- MDX con componentes React embebidos (v2).

## 3. Modelo de dominio

### 3.1 Categorías (catálogo fijo)

```typescript
export const POST_CATEGORIES = [
  'backend',
  'cloud',
  'architecture',
  'algorithms',
  'security',
  'ai',
  'devops',
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
```

Labels UI EN/ES en `lib/i18n/dictionary.ts` bajo `category.{id}`.

### Post

| Campo | Tipo | Reglas |
|-------|------|--------|
| `id` | uuid | PK |
| `slug` | string | único, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 120 |
| `title` | string | 3–200 chars |
| `excerpt` | string | 20–320 chars; fallback primer párrafo |
| `body_md` | text | markdown fuente |
| `body_html` | text | generado server-side al guardar (cache) |
| `status` | enum | `draft` \| `published` |
| `category` | enum | uno de `POST_CATEGORIES`; required |
| `locale` | text | default `'en'`; reservado v2 |
| `cover_image_url` | string? | URL pública Storage |
| `reading_time_minutes` | int | ≥ 1 |
| `author_id` | uuid | FK → auth.users |
| `published_at` | timestamptz? | required si `published` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Reglas de negocio

1. Solo `published` visible en rutas públicas y RSS.
2. Slug inmutable tras publicar **salvo** redirect 301 registrado (tabla `slug_redirects` — fase 1.1).
3. Despublicar → `status: draft`; URL pública devuelve 404 (no leak de borrador).
4. Título H1 en UI = `title`; markdown no debe repetir H1 (warning en editor).

## 4. Rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Home: últimos N posts + intro |
| `/blog` | Listado paginado (12/page) |
| `/blog/[slug]` | Artículo |
| `/categories/[category]` | Posts por categoría |
| `/about` | Sobre el blog / autor |

### URL amigable — ejemplos

```
/blog/heapsort-golang
/blog/nestjs-outbox-pattern
/categories/backend
```

**Prohibido en v1:** `/blog/2018/09/...` (patrón legado Blogger).

## 5. Admin

| Ruta | Acción |
|------|--------|
| `/login` | Supabase Auth |
| `/dashboard` | Lista posts (todos los estados) |
| `/dashboard/posts/new` | Crear |
| `/dashboard/posts/[id]/edit` | Editar + preview |

### Server Actions (borrador API)

| Action | Auth | Descripción |
|--------|------|-------------|
| `createPost` | admin | Crea draft |
| `updatePost` | admin | Actualiza campos + regenera HTML |
| `publishPost` | admin | `status=published`, `published_at=now()` |
| `unpublishPost` | admin | vuelve a draft |
| `deletePost` | admin | soft-delete opcional (v1: hard delete OK) |

Tras `publishPost` / `unpublishPost` → llamar revalidate (`/blog`, `/blog/[slug]`, sitemap).

## 6. Persistencia (Supabase)

```sql
-- posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body_md text not null,
  body_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  category text not null
    check (category in (
      'backend', 'cloud', 'architecture', 'algorithms',
      'security', 'ai', 'devops'
    )),
  locale text not null default 'en',
  cover_image_url text,
  reading_time_minutes int not null default 1,
  author_id uuid not null references auth.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_status_published_at_idx
  on public.posts (status, published_at desc nulls last);

create index posts_category_idx on public.posts (category)
  where status = 'published';
```

### RLS (resumen)

| Rol | posts |
|-----|-------|
| `anon` / `authenticated` (público) | `SELECT` donde `status = 'published'` |
| `admin` (custom claim o tabla `profiles.role`) | CRUD completo |

## 7. Markdown pipeline

```
body_md
  → remark-parse → remark-gfm
  → rehype-slug (heading anchors)
  → rehype-pretty-code (shiki)
  → rehype-sanitize
  → body_html
```

TOC: extraer h2/h3 en server para sidebar (opcional v1, Should).

## 8. UI — lectura

- Layout: header minimal, contenido max-w-prose (~65ch), sidebar TOC en `lg+`.
- Tipografía: cuerpo legible 17–18px, código mono.
- Code blocks: copy button (Should).
- Footer: enlace a andresed.dev, RSS, GitHub.

## 9. Criterios de aceptación

- [ ] Post publicado accesible en `/blog/{slug}` con status 200.
- [ ] Draft no listado ni accesible sin auth.
- [ ] Slug duplicado rechazado con error claro.
- [ ] OG image usa `cover_image_url` o fallback generado.
- [ ] RSS solo incluye `published`.
- [ ] Publicar invalida cache ISR.

## 10. Preguntas abiertas

- ¿Tabla `slug_redirects` en v1 o v1.1? → **v1.1** (blog vacío, sin legado).
- ¿Soft delete vs hard delete? → **hard delete** en v1.

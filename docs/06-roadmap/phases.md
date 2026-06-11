# Roadmap por fases

## Fase 0 — Documentación ✅ (actual)

- [x] Recapitulación y visión
- [x] Arquitectura y ADR-001
- [x] Specs blog, auth, SEO
- [x] Design system
- [x] Decisiones de producto aprobadas ([decisiones.md](../00-vision/decisiones.md))
- [x] Specs blog, auth, seo, i18n → **Aprobada**

## Fase 1 — Scaffold + infra

- [x] Next.js 15 (TypeScript, Tailwind 4, App Router, ESLint)
- [x] Migración SQL `posts` / `profiles` + RLS (`supabase/migrations/`)
- [x] Clientes Supabase SSR + middleware stub
- [x] Lib: categorías, i18n, auth allowlist, SEO site config
- [x] Rutas placeholder: `/`, `/blog`, `/categories/[category]`, `/about`, `/login`, `/dashboard`
- [x] `sitemap.ts`, `robots.ts`
- [x] Proyecto Supabase creado en cloud (`whtyatshxvdvdmpehaoi`)
- [x] Migración `init_schema` + `harden_functions` aplicada
- [x] CI: lint + typecheck en GitHub Actions

**Entregable:** app corre en local; BD migrada; sin UI pulida.

## Fase 2 — Lectura pública

- [x] Home + listado + post detail
- [x] Markdown pipeline (unified + rehype-sanitize)
- [x] Categorías, paginación
- [x] SEO: metadata, sitemap dinámico, JSON-LD
- [x] RSS feed (`/api/feed`)

**Entregable:** lectura pública OK con blog vacío + empty states; Lighthouse SEO 100.

## Fase 3 — Admin

- [x] Login Supabase (email + password)
- [x] Dashboard listado
- [x] Editor markdown + save/publish/unpublish
- [x] Revalidate on publish
- [ ] Upload cover a Storage (URL manual OK en v1)

**Entregable:** puedes publicar un post end-to-end sin tocar BD.

## Fase 4 — Deploy + dominio

- [ ] Vercel production + env vars ([vercel-deploy.md](../07-infra/vercel-deploy.md))
- [ ] `www.makingcode.dev` DNS
- [ ] Search Console + sitemap submit
- [x] OG default image (`src/app/opengraph-image.tsx`)

**Entregable:** blog en producción.

## Fase 5 — Contenido y portafolio

- [ ] Primeros posts nuevos (inglés)
- [ ] (Opcional) Feed consumido por andresed.dev
- [ ] (Backlog) Migración legado Blogger + 301

## Fase 6 — Mejoras

- TOC sidebar, copy code, búsqueda
- Programación de publicación
- Posts multilingües
- MDX components

---

## Orden de trabajo spec-driven

```
Fase 0 approve → Fase 1 → alinear spec infra
              → Fase 2 → alinear spec blog + seo
              → Fase 3 → alinear spec auth
              → Fase 4+
```

Cada fase termina con specs en estado **Alineada** y nota breve en este archivo.

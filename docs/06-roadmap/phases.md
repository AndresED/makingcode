# Roadmap por fases

## Fase 0 — Documentación ✅ (actual)

- [x] Recapitulación y visión
- [x] Arquitectura y ADR-001
- [x] Specs blog, auth, SEO
- [x] Design system
- [x] Decisiones de producto aprobadas ([decisiones.md](../00-vision/decisiones.md))
- [x] Specs blog, auth, seo, i18n → **Aprobada**

## Fase 1 — Scaffold + infra

- [ ] `create-next-app` (TypeScript, Tailwind, App Router, ESLint)
- [ ] Proyecto Supabase + migración `posts` / `profiles`
- [ ] RLS y allowlist admin
- [ ] `.env.example`, README setup local
- [ ] CI: lint + typecheck

**Entregable:** app corre en local; BD migrada; sin UI pulida.

## Fase 2 — Lectura pública

- [ ] Home + listado + post detail
- [ ] Markdown pipeline + syntax highlight
- [ ] Categorías, paginación, UI i18n EN/ES
- [ ] SEO: metadata, sitemap, robots, JSON-LD
- [ ] RSS feed

**Entregable:** lectura pública OK con blog vacío + empty states; Lighthouse SEO 100.

## Fase 3 — Admin

- [ ] Login Supabase (email + password)
- [ ] Dashboard listado
- [ ] Editor markdown + preview
- [ ] Publish / unpublish + revalidate
- [ ] Upload cover a Storage

**Entregable:** puedes publicar un post end-to-end sin tocar BD.

## Fase 4 — Deploy + dominio

- [ ] Vercel production + env vars
- [ ] `www.makingcode.dev` DNS
- [ ] Search Console + sitemap submit
- [ ] OG default image

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

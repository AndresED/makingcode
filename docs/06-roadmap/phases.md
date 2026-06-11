# Roadmap por fases

## Fase 0 — Documentación ✅ (actual)

- [x] Recapitulación y visión
- [x] Arquitectura y ADR-001
- [x] Specs blog, auth, SEO
- [x] Design system
- [ ] **Tu revisión** → specs a estado **Aprobada**

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
- [ ] Tags, paginación
- [ ] SEO: metadata, sitemap, robots, JSON-LD
- [ ] RSS feed

**Entregable:** posts seed publicados visibles; Lighthouse SEO 100.

## Fase 3 — Admin

- [ ] Login Supabase (magic link o password)
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

## Fase 5 — Migración y portafolio

- [ ] Redirects 301 legado (subset)
- [ ] 1–2 posts nuevos de marca
- [ ] (Opcional) Feed consumido por andresed.dev

## Fase 6 — Mejoras

- TOC sidebar, copy code, búsqueda
- Programación de publicación
- i18n EN/ES
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

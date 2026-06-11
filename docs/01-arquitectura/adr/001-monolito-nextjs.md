# ADR-001 — Monolito Next.js con backend interno

| Campo | Valor |
|-------|--------|
| **Estado** | Aceptada |
| **Fecha** | 2026-06-10 |
| **Decisores** | Andrés Esquivel |

## Contexto

Necesitamos blog con auth, CRUD de posts, SEO y admin. Opciones: CMS headless (Sanity, Contentful), backend NestJS separado, o Next.js full-stack.

## Decisión

**Un solo repo Next.js** con Server Actions / Route Handlers y Supabase como persistencia y auth.

## Razones

1. **Alcance acotado** — Un autor, CRUD simple; no justifica microservicio.
2. **SEO** — RSC + ISR nativos en App Router.
3. **Coste y DX** — Un deploy, tipos compartidos, mismo stack que el portafolio modernizado.
4. **Supabase** — Auth + Postgres + Storage sin operar otro servidor.

## Consecuencias

- Lógica de negocio vive en `lib/`; si crece, extraer a paquetes internos, no otro servicio aún.
- Límites de Vercel serverless (timeout) — posts largos OK; jobs pesados fuera de scope.
- Migración futura a API pública es viable vía Route Handlers sin reescribir dominio.

## Alternativas descartadas

| Alternativa | Por qué no (v1) |
|-------------|-----------------|
| NestJS + SPA | Más piezas, peor SEO out-of-the-box |
| Sanity/Contentful | Coste, vendor lock-in, menos control de URLs/markup |
| Astro + Supabase solo estático | Admin y preview dinámico más incómodos |

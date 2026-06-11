# AGENTS.md — Making Code

Guía para agentes IA trabajando en este repo.

## Antes de codificar

1. Leer `docs/README.md` y la spec del bounded context en `docs/03-specs/`.
2. No implementar si la spec está en **Borrador** sin OK del usuario.
3. Tras implementar, actualizar spec a **Alineada**.

## Stack

- Next.js 15 App Router, TypeScript strict, Tailwind, Supabase.
- Server Actions para mutaciones admin; RLS siempre activo.
- SEO: ver `docs/03-specs/seo/spec.md` en cada página pública.

## Convenciones

- Slugs: kebab-case, sin fechas en la URL.
- Sin `any` en dominio; Zod en fronteras server.
- Secretos solo en env; validar en `mem_save` / logs sin PII.
- Diseño: tokens en `docs/04-diseno/design-system.md`.

## Comandos (cuando exista package.json)

```bash
npm run dev
npm run build
npm run lint
```

## Memoria

Guardar en Engram decisiones de arquitectura y respuestas a preguntas abiertas del usuario.

# Making Code

Blog técnico de **Andrés Esquivel** — reconstrucción desde cero con Next.js, Supabase y spec-driven development.

| | |
|---|---|
| **Dominio** | [makingcode.dev](https://www.makingcode.dev/) |
| **Marca personal** | [andresed.dev](https://www.andresed.dev/) |
| **Estado** | Fase 0 — documentación y especificación |

## Contexto

El blog actual (Blogger, ~2015–2018) refleja contenido de universidad. La nueva versión apoya la marca personal actual: backend, arquitectura cloud, IA aplicada y buenas prácticas de ingeniería.

## Documentación

Toda la planificación vive en [`docs/`](./docs/README.md). No se implementa código de producto sin spec aprobada.

```
docs/
├── 00-vision/          Visión, recapitulación, objetivos
├── 01-arquitectura/    Stack, capas, decisiones (ADR)
├── 02-requerimientos/  Historias y criterios de aceptación
├── 03-specs/           Specs por bounded context
├── 04-diseno/          Design system y UX
├── 05-migracion/       Plan desde blog legado
└── 06-roadmap/         Fases de entrega
```

## Principios

1. **Spec-first** — spec → implementación → tests → deploy.
2. **SEO vital** — URLs amigables, metadata, sitemap, OG, JSON-LD, rendimiento.
3. **Ligero** — diseño alineado con andresed.dev (oscuro, tipografía clara, sin bloat).
4. **Seguro** — auth en admin; sin secretos en repo; RLS en Supabase.

## Desarrollo local

```bash
cp .env.example .env.local
# Fill Supabase URL and keys (see supabase/README.md)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

## Siguiente paso

1. Crear proyecto Supabase y aplicar `supabase/migrations/20260610000000_init.sql`
2. Fase 2 — lectura pública con posts desde BD
3. Fase 3 — login + editor markdown

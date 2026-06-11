# Recapitulación — Making Code

## Situación actual

| Aspecto | Estado |
|---------|--------|
| **Plataforma** | Blogger (`makingcode.dev`) |
| **Contenido** | ~17 artículos (2015–2018): algoritmos, estructuras de datos, criptografía |
| **Perfil del contenido** | Escritura de universidad — válida como archivo histórico, no representa el foco actual |
| **Integración en marca** | Referenciado en [andresed.dev](https://www.andresed.dev/) (`/blog`, portfolio, CTA "17+ artículos") |
| **Observación externa** | Blog antiguo; coherente con la realidad del contenido |

## Por qué reconstruir (no solo rediseñar Blogger)

1. **Marca personal** — El blog debe reforzar "Senior Backend Engineer / cloud / arquitectura", no solo archivo académico.
2. **Control total** — URLs, SEO, rendimiento, diseño y flujo editorial propios.
3. **Stack alineado** — Misma línea técnica que el portafolio y los proyectos GitHub (TypeScript, Next.js, Supabase).
4. **Editorial moderno** — Markdown, borradores, preview, publicación programada (fases posteriores).
5. **Un solo ecosistema** — Posts nuevos en makingcode.dev; portafolio enlaza o sincroniza vía API/RSS (fase 2).

## Qué conservamos del legado

- **Dominio** `makingcode.dev`.
- **Archivo histórico** — Los 17 posts pueden migrarse como categoría "Archive" o permanecer enlazados hasta reescritura.
- **Temas fuertes** — Algoritmos, criptografía, backend; ampliar a cloud, NestJS, AWS, IA aplicada.
- **Enlace desde andresed.dev** — Sigue siendo el hub de publicaciones técnicas.

## Qué cambia

| Antes | Después (objetivo) |
|-------|---------------------|
| Blogger, URLs largas con fechas | Next.js App Router, **slugs amigables** (`/blog/heapsort-golang`) |
| Sin auth propia | **Supabase Auth** — solo admin publica |
| HTML embebido en plantilla | **Markdown** → HTML sanitizado (MDX opcional en v2) |
| SEO limitado de plataforma | **SEO first**: metadata, OG, JSON-LD, sitemap, robots, Core Web Vitals |
| Diseño genérico Blogger | **UI oscura, ligera**, coherente con andresed.dev |

## Alcance v1 (MVP)

### Público

- Listado de posts con filtros por tag/categoría.
- Página de post con TOC, código resaltado, tiempo de lectura.
- Página About / enlaces a andresed.dev.
- RSS/Atom feed.
- 404 y estados vacíos cuidados.

### Admin (autenticado)

- Login (email + magic link o password — ver spec auth).
- CRUD posts: título, slug, excerpt, body markdown, cover, tags, estado (`draft` \| `published`).
- Preview antes de publicar.
- Solo rol `admin` (tú).

### Infra

- **Next.js 15** (App Router, RSC donde aporte).
- **Supabase**: PostgreSQL + Auth + Storage (covers).
- Deploy: **Vercel** (recomendado) o similar.
- Variables en `.env.local` — nunca en repo.

## Fuera de alcance v1

- Comentarios públicos.
- Multi-autor / CMS para terceros.
- Newsletter integrada.
- Posts bilingües (contenido solo en **inglés**; UI sí EN/ES — ver [decisiones.md](./decisiones.md)).
- Migración de los 17 posts legados (**blog vacío** al lanzar).

## Relación con andresed.dev

```
andresed.dev (/blog)          makingcode.dev
      │                              │
      │  enlaces / feed / API        │  fuente de verdad de posts
      └──────────────────────────────┘
```

Fase 1: enlaces manuales o feed XML consumido por Astro (opcional).  
Fase 2: API o webhook al publicar → actualizar índice en portafolio.

## Decisiones aprobadas

Ver [decisiones.md](./decisiones.md):

1. **Blog vacío** — sin migración legado en v1.
2. **Contenido en inglés**; **UI bilingüe** EN/ES.
3. **Auth:** email + contraseña (sin registro público).
4. **Categorías fijas** — catálogo de 7 categorías técnicas.

## Referencias en el repo del portafolio

- Posts indexados: `portafolio-2026/src/data/blog/index.ts`
- Proyecto Making Code: `portafolio-2026/src/data/projects.ts`
- Tokens de diseño: `portafolio-2026/tailwind.config.mjs`, `src/styles/global.css`

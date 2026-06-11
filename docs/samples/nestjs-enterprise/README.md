# NestJS Enterprise — tutorial posts for Making Code

Artículos tipo **tutorial** (enseñan conceptos e implementación paso a paso), basados en:

[https://github.com/AndresED/nestjs-enterprise-starter/tree/main/docs/infrastructure](https://github.com/AndresED/nestjs-enterprise-starter/tree/main/docs/infrastructure)

## Covers (`public/images/`)

Coloca las portadas en `public/images/` y referencia en `posts.manifest.json`:

```json
"coverImage": "/images/hexagonal.webp"
```

| Imagen | Post |
|--------|------|
| `hexagonal.webp` | Building Your First Hexagonal Module |
| `cqrs.webp` | Implementing CQRS |
| `event-drive.webp` | Outbox Pattern |
| `multitenant.webp` | Multitenancy |

Posts sin `coverImage` usan el fallback por categoría en la UI. **Publicar requiere cover** en el dashboard.

## Publicar en el blog (automático)

Con `.env.local` configurado (`SUPABASE_SERVICE_ROLE_KEY`):

```bash
npm run seed:posts
```

Opciones:

```bash
npm run seed:posts -- --dry-run
npm run seed:posts -- --slug building-hexagonal-module-nestjs
npm run seed:posts -- --covers-only
```

El script crea o actualiza posts **publicados** en Supabase. Si el slug ya existe, hace update.

## Tutoriales incluidos

| Tutorial | Slug | Categoría |
|----------|------|-----------|
| Building Your First Hexagonal Module in NestJS | `building-hexagonal-module-nestjs` | architecture |
| Implementing CQRS in NestJS | `implementing-cqrs-nestjs-tutorial` | architecture |
| Secure Your NestJS API with JWT | `nestjs-jwt-auth-tutorial` | security |
| How to Implement the Outbox Pattern | `outbox-pattern-nestjs-tutorial` | architecture |
| Background Jobs with BullMQ | `bullmq-nestjs-tutorial` | backend |
| Multitenancy in NestJS | `multitenancy-nestjs-tutorial` | architecture |
| Testing NestJS Handlers with Jest | `nestjs-tdd-handlers-tutorial` | backend |
| Idempotent Event Consumers | `idempotent-consumers-nestjs-tutorial` | backend |

Cada tutorial incluye: **What you'll learn**, pasos numerados, código, verificación (`curl`/tests), errores comunes y siguiente lección.

## Publicar manualmente (dashboard)

1. Abre `posts.manifest.json` para title, slug, category, excerpt
2. Copia el `.body.md` correspondiente al campo **Body** en `/dashboard/posts/new`
3. Publica

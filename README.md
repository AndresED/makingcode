# Making Code

Blog técnico bilingüe de **[Andrés Esquivel](https://www.andresed.dev/)** — backend, cloud, arquitectura y sistemas en producción.

| | |
|---|---|
| **Producción** | [makingcode.dev](https://www.makingcode.dev/) |
| **Portafolio** | [andresed.dev](https://www.andresed.dev/) |
| **Stack** | Next.js 15 · React 19 · Tailwind CSS 4 · Supabase · Vercel |

## Características

### Público
- UI bilingüe **EN/ES** con slugs distintos por idioma
- Listado con búsqueda, categorías, sidebar y RSS (`/api/feed`)
- Artículos con TOC activo, barra de progreso, syntax highlighting (Shiki), posts relacionados y navegación por **series** (`/series/[slug]`)
- Covers con fallback por categoría cuando no hay imagen
- Página **About**, OG dinámico por artículo, sitemap, JSON-LD y `hreflang`
- **Newsletter** con suscripción por email y baja por token (`/newsletter/unsubscribe?token=…`)
- Comentarios opcionales con **Giscus** · Analytics opcional (**Plausible** / **Umami**)

### Admin (`/dashboard`)
- Editor markdown bilingüe, borradores/publicación, series y upload de covers (Supabase Storage)
- Panel de **suscriptores** con notificaciones in-app (badge) y opción de remover
- Revalidación ISR al publicar

## Desarrollo local

```bash
cp .env.example .env.local
# Completa Supabase y, si aplica, EmailJS / analytics (ver abajo)

npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run typecheck
npm run build
```

En Windows, `npm run dev` ya usa `NODE_OPTIONS=--use-system-ca` para evitar errores de certificados con Supabase.

## Variables de entorno

Copia [`.env.example`](./.env.example) a `.env.local`. En Vercel, configura las mismas en **Production** y **Preview**.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Sí (prod) | `https://www.makingcode.dev` — canonical, OG y share |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Anon key (Auth + lectura pública) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Publishable key del dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Newsletter, upload de covers (solo servidor) |
| `SUPABASE_STORAGE_BUCKET` | No | Default: `makingcode` |
| `REVALIDATE_SECRET` | Sí | On-demand revalidation |
| `NEXT_PUBLIC_EMAILJS_*` | No | Welcome email al suscriptor (ver Newsletter) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Analytics Plausible |
| `NEXT_PUBLIC_GISCUS_*` | No | Comentarios en artículos |

## Supabase

1. Crea el proyecto y aplica migraciones en orden desde [`supabase/migrations/`](./supabase/migrations/), o ejecuta los scripts en [`scripts/sql/`](./scripts/sql/) si prefieres el SQL Editor.

Migraciones relevantes:

| Archivo | Qué hace |
|---------|----------|
| `20260610000000_init.sql` | Schema base (`profiles`, `posts`) |
| `20260613000000_bilingual_posts.sql` | Posts bilingües (`title_en/es`, slugs) |
| `20260614000000_post_series_and_storage.sql` | Series y storage |
| `20260616000000_newsletter_subscribers.sql` | Tabla newsletter |
| `20260617000000_newsletter_admin_seen.sql` | Notificaciones admin in-app |
| `20260618000000_newsletter_unsubscribe_token.sql` | Tokens de baja |

2. Crea el usuario admin en **Auth** y asigna rol:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tu-email@ejemplo.com');
```

Detalle en [`supabase/README.md`](./supabase/README.md) y [`docs/07-infra/vercel-deploy.md`](./docs/07-infra/vercel-deploy.md).

## Newsletter + EmailJS

Flujo:

1. El suscriptor se registra → se guarda en `newsletter_subscribers` (API + service role).
2. EmailJS envía el **welcome** al suscriptor (misma cuenta que [portafolio-2026](https://www.andresed.dev/)).
3. El admin ve nuevos suscriptores en `/dashboard/newsletter` (sin email de notificación).
4. Cada correo incluye enlace de baja: `{{unsubscribe_url}}` / `{{unsubscribe_text}}`.

Variables:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
NEXT_PUBLIC_EMAILJS_NEWSLETTER_WELCOME_TEMPLATE_ID=...
```

**Template EmailJS** — Settings:
- **To Email:** `{{to_email}}`
- **Subject:** `{{subject}}`

Variables del template: `to_email`, `subject`, `message`, `site_name`, `site_url`, `locale`, `unsubscribe_url`, `unsubscribe_text`.

En **Account → Security**, permite `www.makingcode.dev` y `localhost`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Build de producción |
| `npm run seed:posts` | Publicar posts de muestra NestJS (`docs/samples/nestjs-enterprise/`) |
| `npm run seed:publicaciones` | Seed alternativo de publicaciones |

## Deploy

Deploy en **Vercel** con dominio `www.makingcode.dev`. Checklist completo: [`docs/07-infra/vercel-deploy.md`](./docs/07-infra/vercel-deploy.md).

Tras configurar env vars, redeploy. Verifica:

- Home, `/blog`, `/about`, `/api/feed`
- Login → `/dashboard` → crear/publicar post con cover
- Suscripción newsletter y enlace de baja
- `https://www.makingcode.dev/sitemap.xml`

## Documentación

Specs, arquitectura y roadmap en [`docs/`](./docs/README.md).

## Principios

1. **Spec-first** — cambios con spec y diff mínimo.
2. **SEO-first** — metadata, ISR, URLs canónicas y contenido bilingüe.
3. **Seguro** — RLS, secrets en env, admin con allowlist, sin PII en logs.

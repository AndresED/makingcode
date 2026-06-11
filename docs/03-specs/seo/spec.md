# Spec — SEO

| Campo | Valor |
|-------|--------|
| **Código** | `app/sitemap.ts`, `app/robots.ts`, `lib/seo/`, layouts |
| **Requerimientos** | [E3](../../02-requerimientos/README.md) |
| **Última revisión** | 2026-06-10 |
| **Estado** | Aprobada |

## 1. Propósito

Maximizar descubribilidad orgánica y calidad de previews al compartir — requisito **vital** del proyecto.

## 2. URLs canónicas

| Regla | Implementación |
|-------|----------------|
| Dominio canónico | `https://www.makingcode.dev` (www, HTTPS) |
| Sin trailing slash duplicado | Middleware redirect si aplica |
| Slugs estables | Ver blog spec |
| Paginación | `/blog?page=2` con `rel=prev/next` en metadata |

## 3. Metadata por tipo de página

### Global (`layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://www.makingcode.dev'),
  title: { default: 'Making Code', template: '%s | Making Code' },
  description: 'Technical writing on backend engineering, cloud, and software architecture.',
  openGraph: { type: 'website', locale: 'en_US', siteName: 'Making Code' },
  twitter: { card: 'summary_large_image', creator: '@andres30xed' },
  robots: { index: true, follow: true },
};
```

### Post (`/blog/[slug]`)

| Campo | Fuente |
|-------|--------|
| `title` | `post.title` |
| `description` | `post.excerpt` (≤ 160 chars) |
| `canonical` | `/blog/{slug}` |
| `og:image` | cover o imagen OG por defecto 1200×630 |
| `article:published_time` | `published_at` |
| `article:section` | `category` (label EN) |

### JSON-LD (Article)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "datePublished": "...",
  "dateModified": "...",
  "author": { "@type": "Person", "name": "Andrés Esquivel", "url": "https://www.andresed.dev" },
  "image": "...",
  "publisher": { "@type": "Organization", "name": "Making Code" }
}
```

## 4. Sitemap

`app/sitemap.ts` — entradas dinámicas:

- `/` — priority 1.0
- `/blog` — 0.9
- `/about` — 0.5
- Cada `/blog/{slug}` publicado — 0.8, `lastModified: updated_at`
- `/categories/{category}` — 0.6

Regenerar on publish vía `revalidatePath` / on-demand.

## 5. robots.txt

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /login/
Sitemap: https://www.makingcode.dev/sitemap.xml
```

## 6. Rendimiento (Core Web Vitals)

| Táctica | Detalle |
|---------|---------|
| Fuentes | Self-hosted woff2 (lección del portafolio — no bloquear LCP) |
| Imágenes | `next/image`, WebP/AVIF, sizes correctos en covers |
| JS | RSC; mínimo client JS en lectura |
| Preload | Hero / font display solo lo necesario |

Objetivo: **LCP &lt; 2.5s** en post típico móvil.

## 7. Migración SEO (legado Blogger)

Mapa 301 en `docs/05-migracion/redirects.csv` (fase migración):

```
/blog/implementacion-del-metodo-de-ordenacion_72 → /blog/heapsort-golang
```

Implementar en `middleware.ts` o `next.config redirects` cuando existan slugs nuevos.

## 8. Search Console

- Verificar propiedad al deploy.
- Enviar sitemap manualmente día 1.
- Monitorizar cobertura 30/60/90 días.

## 9. Criterios de aceptación

- [ ] Lighthouse SEO = 100 en home y post de prueba.
- [ ] Una sola URL canónica por post (sin duplicados www/non-www).
- [ ] OG preview válida en LinkedIn Debugger y Twitter Card Validator.
- [ ] JSON-LD sin errores en Rich Results Test.
- [ ] `/dashboard` no indexable.

## 10. Checklist pre-publicar post

- [ ] Slug legible y estable
- [ ] Excerpt ≤ 160 caracteres
- [ ] Cover 1200×630 o fallback OK
- [ ] Al menos un H2 en contenido largo
- [ ] Categoría correcta del catálogo fijo

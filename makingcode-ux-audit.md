# Auditoría UX/UI — Making Code
**URL auditada:** https://makingcode-delta.vercel.app/  
**Fecha:** 11 de junio de 2026  
**Stack:** Next.js 15.3 · React 19 · Tailwind CSS 4 · Supabase · Vercel  
**Tipo de sitio:** Blog técnico personal de autor (Andrés Esquivel, Senior Backend Engineer)

---

## Contexto para el agente

Este documento es una auditoría técnica y de UX/UI completa del blog Making Code. Está redactado para que un agente de desarrollo pueda leerlo, priorizar tareas, e implementar mejoras sin necesidad de contexto adicional. Cada sección incluye el problema observado, su impacto, y la solución técnica concreta.

El blog tiene actualmente 2 posts publicados. Muchas de las fricciones de UX se amplifican por la falta de contenido — algunas mejoran solas con más artículos, otras requieren intervención inmediata.

---

## 🚨 Bug crítico en producción — acción inmediata

### `NEXT_PUBLIC_SITE_URL` apunta a `localhost:3000`

**Estado:** Activo en producción ahora mismo.  
**Impacto:** Crítico. Afecta SEO, compartir en redes, y la OG image.

**Síntomas confirmados:**
```
meta-og:image      → http://localhost:3000/opengraph-image
meta-og:url        → http://localhost:3000/blog/[slug]
canonical          → http://localhost:3000/blog/[slug]
twitter:image      → http://localhost:3000/blog/[slug]/opengraph-image
share button (LinkedIn) → comparte URL de localhost
share button (X)        → comparte URL de localhost
```

**Causa raíz:** La variable de entorno `NEXT_PUBLIC_SITE_URL` no está configurada en Vercel. El código hace fallback a `localhost:3000`.

**Solución:**
1. Ir a Vercel → proyecto `makingcode` → Settings → Environment Variables
2. Añadir: `NEXT_PUBLIC_SITE_URL = https://makingcode-delta.vercel.app`
3. Aplicar a Production, Preview, y Development
4. Redeploy (o hacer push de cualquier commit)

**Archivos afectados:** `src/lib/seo/site.ts` (donde se define `siteConfig.url`)

---

## Inventario de páginas auditadas

| Página | Ruta | Estado UX |
|--------|------|-----------|
| Home | `/` | Funcional pero débil en conversión |
| Blog (listado) | `/blog` | Inconsistencia visual entre cards |
| Artículo individual | `/blog/[slug]` | Buena experiencia de lectura |
| About | `/about` | Casi vacía — prioridad alta |
| Categorías | `/categories/[category]` | Sin indicador de estado activo |

---

## Evaluación general

| Dimensión | Puntuación | Comentario |
|-----------|-----------|-----------|
| Identidad visual | 9/10 | Paleta oscura consistente, tipografía de 3 familias bien elegida |
| Experiencia de lectura (post) | 8/10 | TOC activo, progress bar, syntax highlighting, share bar |
| Home UX | 5/10 | Sin CTA, tagline genérica, autor invisible |
| About page | 2/10 | 2 frases + iniciales. No comunica quién es el autor |
| Mobile UX | 6/10 | Sidebar oculto en mobile, categorías inaccesibles |
| Conversión / retención | 3/10 | Sin suscripción, sin CTA activos, sin analytics |
| SEO técnico | 6/10 | Estructura correcta pero bug crítico de localhost activo |

---

## Hallazgos por página

---

### 1. Home (`/`)

#### Problema: Tagline no comunica valor personal

**Observado:** `"Technical writing on backend, cloud, and architecture."`  
**Impacto:** El usuario no sabe quién escribe el blog ni por qué debería leerlo a él específicamente.  
**Solución:** Reescribir con voz y credenciales del autor.

```
Antes: "Technical writing on backend, cloud, and architecture."
Después: "Senior Backend Engineer. Escribo sobre lo que construyo en producción: NestJS, AWS y sistemas distribuidos."
```

**Archivo:** `src/lib/seo/site.ts` o el componente hero del home.

---

#### Problema: No hay CTA principal en el hero

**Observado:** El hero tiene título y tagline pero ningún botón de acción.  
**Impacto:** El usuario no tiene un próximo paso sugerido. Especialmente crítico con solo 2 posts — no hay suficiente contenido para que el scroll guíe la experiencia.  
**Solución:** Añadir dos botones debajo del tagline:

```tsx
// Botón primario
<Link href="/blog">Read the blog →</Link>

// Botón secundario
<a href="https://www.andresed.dev" target="_blank" rel="noopener">
  View portfolio ↗
</a>
```

---

#### Problema: El autor es invisible en el home

**Observado:** No hay ninguna mención visible del autor en la página principal.  
**Impacto:** Es un blog personal — la voz del autor es el diferenciador principal. Sin presentación, el blog parece genérico.  
**Solución:** Añadir una microbiografía debajo del hero con: foto real + nombre + cargo + 1-2 líneas.

```tsx
<section className="author-intro">
  <img src="/foto-andres.jpg" alt="Andrés Esquivel" width={48} height={48} className="rounded-full" />
  <div>
    <p className="font-medium">Andrés Esquivel</p>
    <p className="text-muted">Senior Backend Engineer · Lima, Perú</p>
  </div>
</section>
```

---

#### Problema: Sin mecanismo de suscripción

**Observado:** No hay formulario de email, ni mención de newsletter.  
**Impacto:** El lector que termina un artículo y quiere seguir al autor no tiene forma de hacerlo (más allá del RSS, que no es habitual para audiencias no técnicas).  
**Solución:** Añadir un formulario mínimo en el home y al final de cada post.

**Stack sugerido:** Resend (envío de emails) + tabla `subscribers` en Supabase (ya existente) + Server Action de Next.js para el submit.

```sql
-- Migración Supabase
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

```tsx
// Server Action
'use server'
export async function subscribeEmail(email: string) {
  const supabase = createClient()
  await supabase.from('subscribers').insert({ email })
}
```

---

### 2. Blog — listado (`/blog`)

#### Problema: Barra de búsqueda duplicada

**Observado:** Hay dos campos de búsqueda en la misma vista: uno en el sidebar (desktop) y otro encima del listado de posts.  
**Impacto:** Genera ruido visual y confusión — el usuario no sabe cuál usar.  
**Solución:** Eliminar el campo de búsqueda encima del listado. Mantener solo el del sidebar en desktop. En mobile, mostrar un único campo en la parte superior del contenido principal.

**Archivo:** `src/components/layout/list-layout.tsx`

---

#### Problema: Inconsistencia visual entre cards

**Observado:** El post "CQRS in NestJS" no tiene imagen de cover — se muestra como un bloque de texto plano. El post "Hexagonal Architecture" sí tiene imagen. Las dos cards en el listado se ven completamente diferentes.  
**Impacto:** Rompe el ritmo visual del grid. Parece que uno de los posts está "roto".  
**Solución (opción A):** Generar covers automáticas para posts sin imagen basadas en la categoría y el título.

```tsx
// En PostCard — fallback generativo
{post.cover_url ? (
  <Image src={post.cover_url} alt={post.title} />
) : (
  <div className={`cover-fallback bg-category-${post.category}`}>
    <span className="cover-initial">{post.title[0]}</span>
  </div>
)}
```

**Solución (opción B):** Requerir cover en el dashboard antes de publicar un post (validación en el formulario de creación).

---

#### Problema: Categorías sin indicador de estado activo

**Observado:** Al navegar a `/categories/architecture`, no hay ningún resaltado visual en el sidebar que indique que "Architecture" es la categoría activa.  
**Impacto:** El usuario pierde el contexto de navegación.  
**Solución:**

```tsx
// En el componente de lista de categorías del sidebar
const pathname = usePathname()

<Link
  href={`/categories/${category.slug}`}
  className={cn(
    'category-link',
    pathname === `/categories/${category.slug}` && 'category-link--active'
  )}
>
  {category.name}
</Link>
```

---

#### Problema: Categorías inaccesibles en mobile

**Observado:** El sidebar con categorías tiene `className="hidden lg:block"` — desaparece completamente en pantallas menores a 1024px.  
**Impacto:** Los usuarios de mobile no tienen forma de filtrar por categoría.  
**Solución:** Añadir chips de categorías horizontales con scroll en mobile, encima del listado de posts.

```tsx
// Solo visible en mobile
<div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
  {categories.map(cat => (
    <Link
      key={cat.slug}
      href={`/categories/${cat.slug}`}
      className="category-chip flex-shrink-0"
    >
      {cat.name}
    </Link>
  ))}
</div>
```

---

### 3. Artículo individual (`/blog/[slug]`)

#### Fortalezas (mantener)

- TOC con scroll activo y highlight de sección actual
- Barra de progreso de lectura
- Tiempo de lectura estimado
- Syntax highlighting con Shiki
- Posts relacionados al final
- Share bar con LinkedIn, X, y copy link
- Author card al final del artículo

---

#### Problema: Share buttons apuntan a localhost

**Observado:** El botón "Share on LinkedIn" y "Share on X" generan URLs con `localhost:3000`.  
**Impacto:** Crítico. Cualquier share en redes sociales lleva a una URL inaccesible.  
**Causa:** Mismo origen que el bug de `NEXT_PUBLIC_SITE_URL`. Se resuelve con la misma corrección.

---

#### Problema: Author card con iniciales "AE" sin foto real

**Observado:** El `AuthorCard` al final de cada post muestra un box con gradiente y las letras "AE".  
**Impacto:** Reduce la percepción de credibilidad y la conexión emocional con el lector. Una foto real es el elemento de mayor retorno en trust con el menor esfuerzo técnico.  
**Solución:** Reemplazar el avatar de iniciales con un `<Image>` de Next.js.

**Archivo:** `src/components/blog/author-card.tsx`

```tsx
// Antes
<div className="author-initials">AE</div>

// Después
<Image
  src="/images/andres-esquivel.jpg"
  alt="Andrés Esquivel"
  width={56}
  height={56}
  className="rounded-full"
/>
```

Usar la misma foto en `/about` para consistencia.

---

#### Problema: Sin botón "Back to top"

**Observado:** En posts largos no hay forma rápida de volver al inicio (TOC, nav, siguiente artículo).  
**Impacto:** Fricción en la navegación después de terminar la lectura.  
**Solución:** Botón flotante que aparece después de scrollear 300px.

```tsx
'use client'
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="back-to-top"
      aria-label="Back to top"
    >
      ↑
    </button>
  )
}
```

---

#### Problema: Sin comentarios ni reacciones

**Observado:** El artículo no tiene sistema de comentarios ni forma de feedback inline.  
**Impacto:** El lector no puede interactuar ni hacer preguntas. Reduce el engagement.  
**Solución recomendada:** Giscus (comentarios vía GitHub Discussions — sin backend propio, respeta el perfil técnico del blog).

```tsx
// src/components/blog/comments.tsx
import Giscus from '@giscus/react'

export function Comments() {
  return (
    <Giscus
      repo="AndresED/makingcode"
      repoId="[tu-repo-id]"
      category="Comments"
      categoryId="[tu-category-id]"
      mapping="pathname"
      theme="dark"
      lang="en"
    />
  )
}
```

Alternativa más simple: botón "Discuss on X" que abra un tweet draft pre-llenado con el título y URL del artículo.

---

### 4. About (`/about`)

#### Problema: La página About está casi vacía

**Observado:** La página contiene: 2 frases sobre el blog, las iniciales "AE" en un box, 2 links (Portfolio y Blog).  
**Impacto:** Esta es la segunda página más visitada en cualquier blog personal. Un lector que disfrutó un artículo viene aquí para conocer al autor. Lo que encuentra ahora no retiene ni genera confianza.

**Contenido mínimo recomendado para la página About:**

```md
## Sobre mí
Foto real (elemento #1 en impacto visual)

Párrafo 1 — De dónde vengo: formación, inicio en programación
Párrafo 2 — Qué construyo hoy: NestJS microservices, AWS, sistemas distribuidos en producción
Párrafo 3 — Por qué escribo este blog: qué aprendo al enseñar, qué quiero documentar
Párrafo 4 — (Opcional) Algo personal: dónde vivo, intereses fuera de la pantalla

## Stack actual
Lista de tecnologías principales con iconos

## En qué estoy trabajando ahora
1-2 líneas sobre el proyecto o tema actual

## Links
GitHub · LinkedIn · Medium · X · CV · Portfolio
```

**Archivo:** `src/app/about/page.tsx`

---

### 5. SEO técnico

#### Problema: Canónicas apuntan a localhost

Cubierto en la sección de bug crítico. Se resuelve configurando `NEXT_PUBLIC_SITE_URL`.

---

#### Problema: Sin `hreflang` para posts bilingues

**Observado:** El blog tiene posts con `slug_en` y `slug_es` (dos URLs distintas para EN y ES), pero no hay etiquetas `hreflang` que informen a Google de la relación entre ellas.  
**Impacto:** Google puede indexar ambas versiones como contenido duplicado y penalizar la posición en los resultados.

**Solución:** En `generateMetadata` de la página de artículo:

```tsx
// src/app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  return {
    // ... resto de metadatos
    alternates: {
      canonical: `${siteUrl}/blog/${params.slug}`,
      languages: {
        'en': `${siteUrl}/blog/${post.slug_en}`,
        'es': `${siteUrl}/blog/${post.slug_es}`,
      }
    }
  }
}
```

---

#### Problema: `revalidate` uniforme para todas las páginas

**Observado:** Todas las páginas tienen `export const revalidate = 3600`. Esto es subóptimo para páginas con diferentes tasas de cambio.  
**Recomendación:**

```ts
// /about — cambia raramente
export const revalidate = 86400 // 24 horas

// /blog/[slug] — artículo individual, cambia muy poco
export const revalidate = 3600 // 1 hora (ok)

// /blog — listado de posts, se actualiza al publicar
export const revalidate = 300 // 5 minutos

// /dashboard — admin, siempre fresco
export const revalidate = 0
```

---

#### Problema: Sin sistema de analytics

**Observado:** No hay ningún script de analytics cargado en el sitio.  
**Impacto:** Sin datos no es posible saber qué artículos generan más tráfico, dónde rebotan los usuarios, ni desde dónde llegan.  
**Solución recomendada:** Plausible Analytics o Umami. Ambos son privacidad-first, sin cookies, GDPR-compliant, y tienen integración sencilla con Next.js.

```tsx
// Plausible — añadir en src/app/layout.tsx
<Script
  defer
  data-domain="makingcode-delta.vercel.app"
  src="https://plausible.io/js/script.js"
/>
```

---

## Lista de tareas priorizada

### Prioridad 1 — Esta semana (bugs y quick wins)

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 1 | Configurar `NEXT_PUBLIC_SITE_URL` en Vercel | 15 min | Crítico |
| 2 | Subir foto real al `AuthorCard` y `/about` | 30 min | Alto |
| 3 | Reescribir tagline del home | 10 min | Alto |
| 4 | Eliminar búsqueda duplicada en `/blog` | 20 min | Medio |
| 5 | Añadir indicador activo en categorías del sidebar | 30 min | Medio |

### Prioridad 2 — Próximos 2 sprints

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 6 | Escribir página About completa (contenido, no código) | 2 horas | Alto |
| 7 | Añadir CTA + microbiografía en el hero del home | 1 hora | Alto |
| 8 | Añadir `hreflang` en `generateMetadata` de artículos | 1 hora | Medio (SEO) |
| 9 | Cover fallback generativa para posts sin imagen | 2 horas | Medio |
| 10 | Chips de categorías horizontales en mobile | 1 hora | Medio |
| 11 | Botón "Back to top" en artículos | 30 min | Bajo |
| 12 | Ajustar `revalidate` por tipo de página | 30 min | Bajo |

### Prioridad 3 — Backlog (cuando haya más contenido)

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 13 | Sistema de suscripción por email (Resend + Supabase) | 4 horas | Alto (retención) |
| 14 | Instalar Plausible o Umami Analytics | 30 min | Alto (datos) |
| 15 | Comentarios con Giscus | 1 hora | Medio |
| 16 | Modo claro (light mode toggle) | 4-6 horas | Medio (accesibilidad) |
| 17 | Ordenamiento y filtros en listado de blog | 2 horas | Bajo (con pocos posts) |
| 18 | Mejora del contraste de `ink-muted` (#8b919c → #9ca3ad) | 15 min | Bajo (accesibilidad) |

---

## Fortalezas del diseño actual (no tocar)

El diseño visual del blog es su mayor activo. Estas decisiones están bien tomadas y no deben modificarse:

- **Paleta dark-only** con tokens bien definidos (`dark-950/900/800`, `accent-500`, `meta-500`)
- **Tipografía de 3 familias**: DM Sans (UI), Newsreader (display/titulares), JetBrains Mono (código)
- **Gradiente de fondo sutil** en el body (`accent-500/0.08`) — añade profundidad sin saturar
- **Transiciones uniformes** a 150ms en toda la interfaz
- **TOC con scroll activo** en artículos — excelente para orientación en posts largos
- **Barra de progreso de lectura** — detalle que los lectores técnicos aprecian
- **Syntax highlighting con Shiki** — calidad de resaltado superior a Prism/Highlight.js
- **Grid responsivo** 1→2→3 columnas en el listado
- **Componente de series** — infraestructura para posts relacionados entre sí
- **Internacionalización EN/ES** — slug fallback bien implementado

---

## Notas técnicas adicionales

### Dependencia `undici`
Se detectó `undici@8.4.1` en el `package.json`. Verificar si es una dependencia directa o transitiva, y si es necesaria explícitamente. Si es transitiva y no se usa directamente, considerar eliminarla para reducir el bundle.

### ISR y Supabase
El patrón de revalidación ISR (`export const revalidate = 3600`) funciona bien para contenido de blog. Complementar con `revalidatePath('/blog')` en las Server Actions del dashboard al publicar un nuevo post, para forzar revalidación inmediata sin esperar la hora.

```ts
// En la Server Action de publicar post
import { revalidatePath } from 'next/cache'

export async function publishPost(id: string) {
  await supabase.from('posts').update({ published: true }).eq('id', id)
  revalidatePath('/blog')
  revalidatePath('/') // home también lista posts recientes
}
```

---

*Auditoría generada el 11 de junio de 2026 mediante revisión del código fuente (repomix) y análisis del sitio en producción.*

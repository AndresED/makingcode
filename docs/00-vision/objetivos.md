# Objetivos y métricas de éxito

## Objetivos de negocio (marca personal)

1. **Credibilidad técnica** — Publicar contenido que respalde el perfil Senior Backend en entrevistas y LinkedIn.
2. **Descubribilidad** — Rankear y compartir bien en Google, LinkedIn y X (OG cards).
3. **Propiedad** — Cero dependencia de Blogger; dominio y datos bajo tu control.
4. **Velocidad editorial** — Publicar un post en &lt; 15 min desde markdown listo.

## Objetivos técnicos

| Objetivo | Criterio |
|----------|----------|
| Rendimiento | Lighthouse Performance ≥ 90 móvil en home y post |
| SEO | Lighthouse SEO = 100; sitemap + robots válidos |
| Seguridad | RLS activo; admin routes protegidas; sin exposición de `service_role` en cliente |
| Mantenibilidad | Specs alineadas; tipos generados desde Supabase |
| Accesibilidad | WCAG 2.2 AA en lectura y admin básico |

## KPIs (post-lanzamiento)

- Impresiones / clics en Search Console (baseline 90 días post-migración).
- Tiempo en página en posts &gt; 2 min (lectura real).
- Core Web Vitals: LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms.
- 1+ post nuevo / mes (meta editorial tuya).

## No-objetivos

- Monetización / ads.
- Volumen masivo tipo Medium.
- Replicar todas las features de un headless CMS enterprise.

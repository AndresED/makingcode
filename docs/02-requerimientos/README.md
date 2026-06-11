# Requerimientos

Historias de usuario agrupadas por épica. Cada épica tiene spec en `docs/03-specs/`.

## Épica E1 — Lectura pública (blog)

| ID | Historia | Prioridad | Spec |
|----|----------|-----------|------|
| E1-US01 | Como lector, quiero ver el listado de posts publicados ordenados por fecha | Must | [blog/spec](../03-specs/blog/spec.md) |
| E1-US02 | Como lector, quiero abrir un post por URL amigable (`/blog/{slug}`) | Must | blog |
| E1-US03 | Como lector, quiero filtrar por categoría fija | Must | blog |
| E1-US06 | Como lector, quiero UI en EN o ES (toggle) | Must | [i18n](../03-specs/i18n/spec.md) |
| E1-US04 | Como lector, quiero ver código con syntax highlighting | Must | blog |
| E1-US05 | Como lector, quiero compartir con preview OG correcta | Must | [seo/spec](../03-specs/seo/spec.md) |

## Épica E2 — Administración

| ID | Historia | Prioridad | Spec |
|----|----------|-----------|------|
| E2-US01 | Como admin, quiero iniciar sesión de forma segura | Must | [auth/spec](../03-specs/auth/spec.md) |
| E2-US02 | Como admin, quiero crear un post en markdown y guardarlo como borrador | Must | blog |
| E2-US03 | Como admin, quiero previsualizar antes de publicar | Must | blog |
| E2-US04 | Como admin, quiero publicar/despublicar y editar slug | Must | blog |
| E2-US05 | Como admin, quiero subir imagen de portada | Should | blog |

## Épica E3 — SEO y descubribilidad

| ID | Historia | Prioridad | Spec |
|----|----------|-----------|------|
| E3-US01 | Como buscador, quiero sitemap.xml actualizado | Must | seo |
| E3-US02 | Como buscador, quiero metadata y JSON-LD Article | Must | seo |
| E3-US03 | Como agregador, quiero RSS/Atom | Should | blog |
| E3-US04 | Como SEO, quiero redirects 301 desde URLs legadas | Could | [migración](../05-migracion/README.md) |

## Épica E4 — Marca y diseño

| ID | Historia | Prioridad | Spec |
|----|----------|-----------|------|
| E4-US01 | Como visitante, quiero una UI oscura y ligera coherente con andresed.dev | Must | [design-system](../04-diseno/design-system.md) |
| E4-US02 | Como visitante, quiero enlace claro al portafolio del autor | Should | blog |

## Épica E5 — Migración (opcional v1)

| ID | Historia | Prioridad | Spec |
|----|----------|-----------|------|
| E5-US01 | Como autor, quiero importar posts históricos a markdown | Could | migración |

## Definición de Done (global)

- [ ] Spec en estado **Alineada**
- [ ] Tests en flujos críticos (slug único, publish, RLS)
- [ ] Lighthouse SEO ≥ 95 en plantilla de post
- [ ] Sin secretos en repo
- [ ] CHANGELOG o nota en roadmap si cambia comportamiento público

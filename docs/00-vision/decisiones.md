# Decisiones de producto (aprobadas)

| Campo | Valor |
|-------|--------|
| **Fecha** | 2026-06-10 |
| **Estado** | Aprobadas |

## 1. Contenido inicial — blog vacío

- **Decisión:** Lanzar sin migrar los 17 posts de Blogger.
- **Motivo:** El legado es de universidad; la marca actual empieza con contenido nuevo.
- **Impacto:** Fase 5 (migración) pasa a opcional / backlog. andresed.dev puede seguir enlazando archivo histórico hasta que publiques posts nuevos.

## 2. Idioma

| Ámbito | Idioma |
|--------|--------|
| **Contenido (posts)** | **Inglés** por defecto |
| **UI (nav, botones, labels, admin)** | **Bilingüe EN / ES** (toggle como andresed.dev) |
| **SEO metadata global** | Inglés (`en_US`) |
| **Posts en español** | Fuera de v1 (campo `locale` reservado para v2) |

## 3. Autenticación admin

- **Decisión:** **Email + contraseña** (Supabase `signInWithPassword`).
- **Sin** registro público; cuenta admin creada manualmente (Supabase Dashboard o seed).
- **Sin** magic link en v1.
- Política de contraseña: mínimo 12 caracteres; Supabase Auth settings reforzados en proyecto.

## 4. Taxonomía — categorías fijas

- **Decisión:** Cada post tiene **una categoría** de catálogo fijo (no tags libres en v1).
- **Rutas:** `/categories/[category]` para listados filtrados.
- **Catálogo v1:**

| `category` | Etiqueta EN | Etiqueta ES |
|------------|-------------|-------------|
| `backend` | Backend | Backend |
| `cloud` | Cloud & AWS | Cloud y AWS |
| `architecture` | Architecture | Arquitectura |
| `algorithms` | Algorithms | Algoritmos |
| `security` | Security & Crypto | Seguridad y cripto |
| `ai` | AI & Applied ML | IA aplicada |
| `devops` | DevOps & Platform | DevOps y plataforma |

## Specs afectadas

- [blog/spec](../03-specs/blog/spec.md) — categorías, contenido EN, blog vacío
- [auth/spec](../03-specs/auth/spec.md) — email/password
- [seo/spec](../03-specs/seo/spec.md) — locale EN
- [i18n/spec](../03-specs/i18n/spec.md) — UI bilingüe

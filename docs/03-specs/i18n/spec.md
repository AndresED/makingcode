# Spec — i18n (UI)

| Campo | Valor |
|-------|--------|
| **Código** | `lib/i18n/`, `components/LocaleToggle.tsx`, layouts |
| **Requerimientos** | [decisiones](../../00-vision/decisiones.md) |
| **Última revisión** | 2026-06-10 |
| **Estado** | Aprobada |

## 1. Propósito

UI bilingüe (EN/ES) alineada a andresed.dev; **contenido de posts en inglés** en v1.

## 2. Alcance v1

### Incluye

- Toggle EN / ES en header (cookie `locale`, default `en`).
- Diccionario `lib/i18n/dictionary.ts` con claves para nav, footer, listados, admin chrome, mensajes de error.
- `html[lang]` actualizado según locale UI.
- Admin: labels de formulario y botones traducidos.

### Excluye v1

- Posts traducidos / pares EN-ES.
- URLs localizadas (`/es/blog/...`).
- `hreflang` por post (solo páginas estáticas si aplica).

## 3. Implementación (patrón portafolio)

```typescript
// lib/i18n/dictionary.ts
export const dictionary = {
  en: { 'nav.blog': 'Blog', ... },
  es: { 'nav.blog': 'Blog', ... },
} as const;

export type Locale = keyof typeof dictionary;
```

- Client: `data-i18n` + script mínimo o React context para toggle.
- Server: leer cookie `locale` para strings en RSC donde haga falta.

## 4. Contenido vs UI

| Elemento | Fuente de idioma |
|----------|------------------|
| Título / body del post | BD (`posts.title`, `body_md`) — inglés |
| Categoría en card | `category` enum → label desde dictionary |
| Nav, CTA, empty states | dictionary[locale] |
| Login form | dictionary[locale] |

## 5. Criterios de aceptación

- [ ] Toggle persiste en cookie entre visitas.
- [ ] Default locale = `en`.
- [ ] Admin y público comparten mismo mecanismo.
- [ ] Sin flash de idioma incorrecto en hidratación (misma estrategia que portafolio).

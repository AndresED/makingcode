# Design system — Making Code

Alineado visualmente con [andresed.dev](https://www.andresed.dev/): oscuro, ligero, legible, sin ruido.

## Principios

1. **Contenido primero** — La tipografía del artículo es el protagonista.
2. **Ligero** — Pocas fuentes, pocos colores, sin animaciones pesadas.
3. **Consistencia** — Misma familia de tokens que el portafolio (reconocimiento de marca).
4. **Accesible** — Contraste AA mínimo; foco visible; `prefers-reduced-motion`.

## Tokens (Tailwind)

Heredados del portafolio (`portafolio-2026/tailwind.config.mjs`):

| Token | Valor | Uso |
|-------|-------|-----|
| `dark-900` | `#0e0f12` | Fondo página |
| `dark-800` | `#15171c` | Superficie cards |
| `dark-700` | `#1c1f26` | Elevación / header |
| `accent-500` | `#c17a4a` | Links hover, acentos cálidos |
| `meta-500` | `#5b8fa8` | Tags, metadata secundaria |
| `ink` | `#e8eaed` | Títulos |
| `ink-body` | `#d6dae1` | Cuerpo |
| `ink-muted` | `#aeb3bd` | Fechas, captions |

## Tipografía

| Rol | Familia | Notas |
|-----|---------|-------|
| Display / headings | **Hubot Sans** (self-hosted) | Solo títulos y logo |
| Body | **Source Sans 3** (self-hosted) | Posts y UI — legibilidad |
| Code | **JetBrains Mono** | Bloques inline y pre |

Tamaños lectura:

- Body post: `text-base` / `lg:text-[17px]`, `leading-7`–`leading-8`
- H1 post: `text-3xl lg:text-4xl font-semibold`
- H2–H3: escala modular, scroll-margin para anchors

## Layout

```
┌─────────────────────────────────────────────┐
│  Header: logo · Blog · Tags · About · ↗ CV  │
├─────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌─────────────┐  │
│  │  Article (max-w-prose)│  │ TOC (lg+)   │  │
│  │  title, meta, cover   │  │             │  │
│  │  markdown body        │  │             │  │
│  └──────────────────────┘  └─────────────┘  │
├─────────────────────────────────────────────┤
│  Footer: RSS · GitHub · andresed.dev          │
└─────────────────────────────────────────────┘
```

- Header sticky, borde sutil `border-white/[0.06]`.
- Grid blog list: 1 col móvil → 2 `md` → 3 `lg` (como portafolio `/blog`).

## Componentes clave

| Componente | Descripción |
|------------|-------------|
| `PostCard` | Cover, título, excerpt, tags, fecha, reading time |
| `TagPill` | `meta-500` outline sutil |
| `Prose` | Estilos `@tailwindcss/typography` custom dark |
| `CodeBlock` | Fondo `dark-800`, copy button |
| `AdminEditor` | Textarea markdown + split preview (fase admin) |

## Admin UI

- Misma paleta; densidad ligeramente mayor.
- Estados claros: badge `Draft` ámbar, `Published` verde apagado.
- Editor: monospace para markdown, preview con mismos estilos `Prose`.

## Referencia visual

- Home portafolio: hero sobrio, sin gradientes agresivos.
- Blog portafolio: cards con hover `border-white/10`, transición 150ms.

## Iconografía

- Lucide React — trazo 1.5px, tamaño 18–20px en nav.

## Modo claro

**Fuera de scope v1** — Solo dark (coherente con marca actual).

# Migración desde Blogger

> **Estado:** Backlog — no forma parte del lanzamiento v1 ([decisiones](../00-vision/decisiones.md): blog vacío).

## Inventario legado

17 artículos indexados en `portafolio-2026/src/data/blog/index.ts`, categorías:

| Categoría | Cantidad | Ejemplo slug nuevo |
|-----------|----------|-------------------|
| Estructuras de datos | 6 | `heapsort-golang` |
| Criptografía | 8 | `rsa-encryption` |
| Algoritmos / otros | 3 | `analisis-diseno-algoritmos` |

URLs legado: `https://www.makingcode.dev/2018/09/implementacion-del-metodo-de-ordenacion_72.html`

## Estrategias

### A — Archivo externo (rápido)

- Posts viejos siguen en Blogger o solo enlazados desde andresed.dev.
- makingcode.dev nuevo solo con contenido nuevo.
- **Pros:** Cero esfuerzo migración. **Contras:** SEO fragmentado.

### B — Migración selectiva (recomendada)

- Reescribir o importar markdown solo de posts que quieras mantener.
- Redirects 301 desde URLs Blogger → slug nuevo.
- Marcar como `legacy: true` o tag `archive`.

### C — Migración completa

- Script scrape RSS/HTML → markdown.
- Revisión manual de cada post.
- **Esfuerzo:** ~2–4 h por post si se limpia bien.

## Plan sugerido (fases)

1. **Lanzar v1** con 1–2 posts nuevos (backend/cloud) — señal de marca actual.
2. **Importar** 3–5 posts históricos más visitados con redirects.
3. **Deprecar** resto o dejar enlaces "Archivo en Medium/Blogger" si aplica.

## Tabla de mapeo (borrador)

| ID portafolio | Slug nuevo propuesto | URL legado |
|---------------|----------------------|------------|
| heapsort-golang | `heapsort-golang` | `/2018/09/implementacion-del-metodo-de-ordenacion_72.html` |
| rsa-encryption | `rsa-encryption` | `/2015/08/cifrado-rsa.html` |
| … | … | … |

Archivo completo: crear `redirects.csv` al validar slugs en spec blog.

## Script de importación (futuro)

```
scripts/
  import-legacy-post.ts   # RSS → markdown files
  upload-to-supabase.ts   # bulk insert drafts
```

No implementar hasta spec blog **Aprobada**.

## SEO durante migración

- Mantener dominio `makingcode.dev`.
- 301 masivos en `next.config.ts` antes de quitar Blogger.
- Avisar en Search Console "cambio de dirección" si cambia estructura de URLs.
- No eliminar Blogger hasta 30 días con redirects verificados.

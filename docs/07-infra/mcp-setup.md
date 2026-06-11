# MCP — Vercel + Supabase

Guía para operar **makingcode** con los MCP configurados en Cursor.

## Vercel MCP

**Team detectado:** `Andrs Esquivel's projects` (`team_WqWVtxHODjAPu5jWAE2XAfzc`)

### Pendiente

- [ ] Crear o importar proyecto **makingcode** en Vercel (repo GitHub)
- [ ] `vercel link` en la raíz del repo (genera `.vercel/project.json`)
- [ ] Variables en Vercel (Production + Preview):

| Variable | Entorno |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.makingcode.dev` (prod) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo server**, encrypted |
| `REVALIDATE_SECRET` | random, encrypted |

### Comandos útiles (CLI)

```bash
vercel link
vercel env pull .env.local
vercel deploy          # preview
vercel deploy --prod   # production
```

## Supabase MCP

### Project ref (configurado)

| Campo | Valor |
|-------|--------|
| **Ref** | `whtyatshxvdvdmpehaoi` |
| **URL** | `https://whtyatshxvdvdmpehaoi.supabase.co` |
| **Key** | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable, no anon JWT) |

Tras editar `~/.cursor/mcp.json`, recarga Cursor (**Developer: Reload Window**) para reconectar el MCP de Supabase.

### Migración inicial

Si `posts` / `profiles` no existen aún:

- Archivo: `supabase/migrations/20260610000000_init.sql`
- Vía MCP: `apply_migration` (nombre `init_schema`)
- O SQL Editor en dashboard

### Local `.env.local`

```bash
cp .env.example .env.local
# Rellenar con MCP get_project_url + get_publishable_keys
```

**No commitear** `.env.local` ni service role.

### MCP read-only

Si en `~/.cursor/mcp.json` aparece `read_only=true` en la URL de Supabase, quítalo para permitir `apply_migration` y `execute_sql` de escritura.

## Orden recomendado

1. Supabase: proyecto + migración + usuario admin
2. `.env.local` con keys
3. `npm run dev` — verificar home
4. Vercel: link + env vars + primer deploy preview
5. Dominio `www.makingcode.dev` → Vercel

## Siguiente fase con MCP

- `generate_typescript_types` → `src/lib/supabase/database.types.ts`
- `get_advisors` → revisar RLS y seguridad post-migración
- Vercel `list_deployments` / `get_deployment_build_logs` tras primer deploy

# Spec — Auth (Admin)

| Campo | Valor |
|-------|--------|
| **Código** | `app/(admin)/`, `middleware.ts`, `lib/supabase/` |
| **Requerimientos** | [E2-US01](../../02-requerimientos/README.md) |
| **Última revisión** | 2026-06-10 |
| **Estado** | Borrador |

## 1. Propósito

Proteger el panel de administración para que solo el autor pueda crear y publicar contenido.

## 2. Alcance

### Incluye (v1)

- Un único usuario admin (tú).
- Login vía **Supabase Auth**.
- Protección de rutas `/dashboard/**` y server actions.
- Sesión en cookie (SSR `@supabase/ssr`).

### Excluye (v1)

- Registro público.
- OAuth social (Google/GitHub) — puede añadirse en v1.1.
- MFA — recomendado post-lanzamiento.

## 3. Método de login (propuesta)

**Opción A (recomendada): Magic Link**

- Email OTP / enlace mágico.
- Sin contraseña que rotar; menos superficie de ataque.
- Supabase envía email (o SMTP custom).

**Opción B: Email + Password**

- Más familiar; requiere política de contraseña fuerte.

> **Pendiente tu decisión** — la spec asume Magic Link hasta confirmación.

## 4. Modelo

### `profiles`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK = `auth.users.id` |
| `role` | text | `admin` \| `reader` (solo `admin` en v1) |
| `display_name` | text | |
| `avatar_url` | text? | |

Trigger: al crear user en Auth → insert `profiles` con `role` según allowlist de emails.

### Allowlist

```typescript
// lib/auth/allowlist.ts
const ADMIN_EMAILS = ['andres30xed@gmail.com'] as const;
```

Solo emails en allowlist obtienen `role: admin` al primer login.

## 5. Middleware

```
Request → middleware.ts
  → refresh session (supabase SSR)
  → si path starts with /dashboard AND no session → redirect /login
  → si path /login AND session admin → redirect /dashboard
```

## 6. Server Actions

Toda action que muta posts:

1. `getUser()` server-side.
2. Verificar `profiles.role === 'admin'`.
3. Si falla → throw `Unauthorized` (no 500 genérico).

## 7. RLS

- Políticas en `posts` usan función `is_admin()` basada en `profiles`.
- **Nunca** confiar solo en ocultar UI; RLS es la última línea.

## 8. Seguridad

- Rate limit en `/login` (Vercel o Upstash — fase 1.1 si no hay en v1).
- `service_role` solo en entorno server.
- Logs sin tokens ni email en texto plano masivo.

## 9. Criterios de aceptación

- [ ] Usuario no allowlisted no accede a dashboard aunque tenga cuenta Auth.
- [ ] Rutas admin redirigen a login sin sesión.
- [ ] Server action rechaza mutación sin rol admin.
- [ ] Logout limpia sesión.

## 10. Preguntas abiertas

- Magic link vs password — ¿cuál prefieres?

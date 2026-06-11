# Deploy en Vercel (Fase 4)

## 1. Primer deploy

```bash
cd makingcode
npx vercel link          # team: Andrs Esquivel's projects
npx vercel deploy        # preview
npx vercel deploy --prod # production
```

O conecta el repo `AndresED/makingcode` en [vercel.com/new](https://vercel.com/new) (Git integration).

## 2. Variables de entorno

Configurar en **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.makingcode.dev` (prod) / URL preview en preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://whtyatshxvdvdmpehaoi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key del dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (solo server, encrypted) |
| `REVALIDATE_SECRET` | string aleatorio largo (encrypted) |

## 3. Dominio `www.makingcode.dev`

En Vercel → **Domains** → añadir `www.makingcode.dev` y `makingcode.dev` (redirect a www).

En tu DNS (registrar):

| Tipo | Nombre | Valor |
|------|--------|-------|
| `CNAME` | `www` | `cname.vercel-dns.com` |
| `A` | `@` | `76.76.21.21` (o redirect según Vercel) |

## 4. Supabase Auth (redirect URLs)

En Supabase → **Authentication → URL Configuration**:

- Site URL: `https://www.makingcode.dev`
- Redirect URLs: `https://www.makingcode.dev/**`, `http://localhost:3000/**`

## 5. Admin

1. Crear usuario `andres30xed@gmail.com` en Supabase Auth.
2. SQL:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'andres30xed@gmail.com');
```

## 6. Post-deploy

- [ ] Verificar home, `/blog`, `/login`, `/api/feed`
- [ ] Publicar un post de prueba desde `/dashboard`
- [ ] Google Search Console: propiedad + sitemap `https://www.makingcode.dev/sitemap.xml`

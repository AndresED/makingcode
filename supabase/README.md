# Supabase setup

## 1. Project

**Ref:** `whtyatshxvdvdmpehaoi` · **URL:** `https://whtyatshxvdvdmpehaoi.supabase.co`

Local env (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (recommended) or legacy anon JWT
- `SUPABASE_SERVICE_ROLE_KEY` — server only, from Dashboard → API Keys

## 2. Run migration

Paste and run `migrations/20260610000000_init.sql` in the SQL Editor, or:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

## 3. Auth settings

- Disable **Sign ups** in Authentication → Providers → Email (invite-only).
- Minimum password length: **12**.
- Site URL: `http://localhost:3000` (dev) / `https://www.makingcode.dev` (prod).

## 4. Bootstrap admin

1. Authentication → Users → **Add user** with your allowlisted email.
2. SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'andres30xed@gmail.com');
```

Never commit passwords or service role keys.

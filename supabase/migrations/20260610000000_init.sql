-- Making Code — initial schema (v1)
-- Run via Supabase SQL editor or: supabase db push

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'reader' check (role in ('admin', 'reader')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body_md text not null,
  body_html text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  category text not null
    check (category in (
      'backend', 'cloud', 'architecture', 'algorithms',
      'security', 'ai', 'devops'
    )),
  locale text not null default 'en',
  cover_image_url text,
  reading_time_minutes int not null default 1 check (reading_time_minutes >= 1),
  author_id uuid not null references auth.users (id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_published_at_check check (
    (status = 'published' and published_at is not null)
    or (status = 'draft')
  )
);

create index posts_status_published_at_idx
  on public.posts (status, published_at desc nulls last);

create index posts_category_idx
  on public.posts (category)
  where status = 'published';

alter table public.posts enable row level security;

create policy "posts_select_published"
  on public.posts for select
  using (status = 'published');

create policy "posts_admin_all"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Auto profile on signup (admin role via allowlist in app layer)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'reader'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

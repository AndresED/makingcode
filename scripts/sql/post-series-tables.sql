-- Normalized series: post_series + post_series_members (replaces posts.series_slug / series_order)
-- Run in Supabase SQL Editor if migrations are not applied via CLI.

-- ---------------------------------------------------------------------------
-- Series catalog
-- ---------------------------------------------------------------------------
create table public.post_series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_en text not null,
  title_es text not null,
  description_en text,
  description_es text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index post_series_slug_idx on public.post_series (slug);

create trigger post_series_set_updated_at
  before update on public.post_series
  for each row execute function public.set_updated_at();

alter table public.post_series enable row level security;

create policy "post_series_select_public"
  on public.post_series for select
  using (true);

create policy "post_series_admin_all"
  on public.post_series for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Series membership (one series per post)
-- ---------------------------------------------------------------------------
create table public.post_series_members (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.post_series (id) on delete cascade,
  post_id uuid not null unique references public.posts (id) on delete cascade,
  position int not null check (position >= 1 and position <= 99),
  created_at timestamptz not null default now(),
  unique (series_id, position)
);

create index post_series_members_series_position_idx
  on public.post_series_members (series_id, position);

create index post_series_members_post_idx
  on public.post_series_members (post_id);

alter table public.post_series_members enable row level security;

create policy "post_series_members_select_published"
  on public.post_series_members for select
  using (
    exists (
      select 1
      from public.posts p
      where p.id = post_id and p.status = 'published'
    )
  );

create policy "post_series_members_admin_all"
  on public.post_series_members for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Migrate legacy columns on posts
-- ---------------------------------------------------------------------------
insert into public.post_series (slug, title_en, title_es)
select distinct
  p.series_slug,
  initcap(replace(p.series_slug, '-', ' ')),
  initcap(replace(p.series_slug, '-', ' '))
from public.posts p
where p.series_slug is not null
  and trim(p.series_slug) <> ''
on conflict (slug) do nothing;

update public.post_series
set title_en = 'NestJS Enterprise',
    title_es = 'NestJS Enterprise'
where slug = 'nestjs-enterprise';

insert into public.post_series_members (series_id, post_id, position)
select
  ps.id,
  p.id,
  coalesce(p.series_order, 1)
from public.posts p
inner join public.post_series ps on ps.slug = p.series_slug
where p.series_slug is not null
  and trim(p.series_slug) <> ''
on conflict (post_id) do update
  set series_id = excluded.series_id,
      position = excluded.position;

drop index if exists public.posts_series_idx;

alter table public.posts
  drop column if exists series_slug,
  drop column if exists series_order;

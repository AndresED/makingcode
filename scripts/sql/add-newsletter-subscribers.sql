-- Run in Supabase SQL Editor if migrations are not applied via CLI.
-- See supabase/migrations/20260616000000_newsletter_subscribers.sql

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz not null default now(),
  admin_seen_at timestamptz,
  constraint newsletter_subscribers_email_unique unique (email)
);

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_subscribers_admin_select" on public.newsletter_subscribers;
create policy "newsletter_subscribers_admin_select"
  on public.newsletter_subscribers for select
  using (public.is_admin());

drop policy if exists "newsletter_subscribers_admin_update" on public.newsletter_subscribers;
create policy "newsletter_subscribers_admin_update"
  on public.newsletter_subscribers for update
  using (public.is_admin());

create index if not exists newsletter_subscribers_unread_idx
  on public.newsletter_subscribers (subscribed_at desc)
  where admin_seen_at is null and status = 'active';

-- Newsletter subscribers (public signup via API + service role insert)

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email)
);

create index newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

-- No public policies: inserts go through server API with service role.
create policy "newsletter_subscribers_admin_select"
  on public.newsletter_subscribers for select
  using (public.is_admin());

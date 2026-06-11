-- Track which subscriptions the admin has seen in the dashboard (in-app notifications).

alter table public.newsletter_subscribers
  add column if not exists admin_seen_at timestamptz;

create index if not exists newsletter_subscribers_unread_idx
  on public.newsletter_subscribers (subscribed_at desc)
  where admin_seen_at is null and status = 'active';

drop policy if exists "newsletter_subscribers_admin_update" on public.newsletter_subscribers;
create policy "newsletter_subscribers_admin_update"
  on public.newsletter_subscribers for update
  using (public.is_admin());

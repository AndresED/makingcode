-- Secure one-click unsubscribe links per subscriber.

alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid;

update public.newsletter_subscribers
set unsubscribe_token = gen_random_uuid()
where unsubscribe_token is null;

alter table public.newsletter_subscribers
  alter column unsubscribe_token set default gen_random_uuid(),
  alter column unsubscribe_token set not null;

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

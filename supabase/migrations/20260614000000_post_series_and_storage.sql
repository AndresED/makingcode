-- Series support for multi-part tutorials
alter table public.posts
  add column if not exists series_slug text,
  add column if not exists series_order int;

create index if not exists posts_series_idx
  on public.posts (series_slug, series_order)
  where status = 'published' and series_slug is not null;

-- Cover images use the public "makingcode" bucket (see 20260615000000_storage_makingcode_policies.sql).
-- Create the bucket in Supabase Dashboard → Storage if it does not exist yet.

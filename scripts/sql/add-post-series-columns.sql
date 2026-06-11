-- Run in Supabase → SQL Editor (project MakingCode)
-- Adds series fields for multi-part tutorials

alter table public.posts
  add column if not exists series_slug text,
  add column if not exists series_order int;

create index if not exists posts_series_idx
  on public.posts (series_slug, series_order)
  where status = 'published' and series_slug is not null;

-- Reload PostgREST schema cache (Supabase usually picks this up within seconds)
notify pgrst, 'reload schema';

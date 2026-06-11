-- Bilingual posts: one row per article with EN + ES content and slugs

alter table public.posts
  add column if not exists title_en text,
  add column if not exists title_es text,
  add column if not exists slug_en text,
  add column if not exists slug_es text,
  add column if not exists excerpt_en text,
  add column if not exists excerpt_es text,
  add column if not exists body_md_en text,
  add column if not exists body_md_es text,
  add column if not exists body_html_en text not null default '',
  add column if not exists body_html_es text not null default '';

-- Migrate legacy single-locale columns (if they still exist)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'title'
  ) then
    update public.posts set
      title_en = case when coalesce(locale, 'en') = 'en' then title else coalesce(title_en, title) end,
      title_es = case when locale = 'es' then title else coalesce(title_es, title) end,
      slug_en = case when coalesce(locale, 'en') = 'en' then slug else coalesce(slug_en, slug) end,
      slug_es = case when locale = 'es' then slug else coalesce(slug_es, slug || '-es') end,
      excerpt_en = case when coalesce(locale, 'en') = 'en' then excerpt else coalesce(excerpt_en, excerpt) end,
      excerpt_es = case when locale = 'es' then excerpt else coalesce(excerpt_es, excerpt) end,
      body_md_en = case when coalesce(locale, 'en') = 'en' then body_md else coalesce(body_md_en, body_md) end,
      body_md_es = case when locale = 'es' then body_md else coalesce(body_md_es, body_md) end,
      body_html_en = case when coalesce(locale, 'en') = 'en' then body_html else coalesce(body_html_en, body_html) end,
      body_html_es = case when locale = 'es' then body_html else coalesce(body_html_es, body_html) end;

    update public.posts set
      title_en = coalesce(title_en, 'Untitled'),
      title_es = coalesce(title_es, title_en),
      slug_en = coalesce(slug_en, 'untitled'),
      slug_es = coalesce(slug_es, slug_en || '-es'),
      excerpt_en = coalesce(excerpt_en, ''),
      excerpt_es = coalesce(excerpt_es, excerpt_en),
      body_md_en = coalesce(body_md_en, ''),
      body_md_es = coalesce(body_md_es, body_md_en),
      body_html_en = coalesce(body_html_en, ''),
      body_html_es = coalesce(body_html_es, body_html_en);

    alter table public.posts drop constraint if exists posts_slug_key;
    alter table public.posts drop column if exists title;
    alter table public.posts drop column if exists slug;
    alter table public.posts drop column if exists excerpt;
    alter table public.posts drop column if exists body_md;
    alter table public.posts drop column if exists body_html;
    alter table public.posts drop column if exists locale;
  end if;
end $$;

alter table public.posts alter column title_en set not null;
alter table public.posts alter column title_es set not null;
alter table public.posts alter column slug_en set not null;
alter table public.posts alter column slug_es set not null;
alter table public.posts alter column excerpt_en set not null;
alter table public.posts alter column excerpt_es set not null;
alter table public.posts alter column body_md_en set not null;
alter table public.posts alter column body_md_es set not null;

drop index if exists posts_slug_en_unique;
drop index if exists posts_slug_es_unique;
create unique index posts_slug_en_unique on public.posts (slug_en);
create unique index posts_slug_es_unique on public.posts (slug_es);

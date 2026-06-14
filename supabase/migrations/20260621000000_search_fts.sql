-- Full-text search for published posts and series (bilingual en/es)

-- ---------------------------------------------------------------------------
-- Search vectors on posts
-- ---------------------------------------------------------------------------
alter table public.posts
  add column if not exists search_vector_en tsvector,
  add column if not exists search_vector_es tsvector;

create or replace function public.posts_set_search_vectors()
returns trigger
language plpgsql
as $$
begin
  new.search_vector_en :=
    setweight(to_tsvector('english', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt_en, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(left(new.body_md_en, 80000), '')), 'C');
  new.search_vector_es :=
    setweight(to_tsvector('spanish', coalesce(new.title_es, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.excerpt_es, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(left(new.body_md_es, 80000), '')), 'C');
  return new;
end;
$$;

drop trigger if exists posts_search_vectors on public.posts;
create trigger posts_search_vectors
  before insert or update of title_en, title_es, excerpt_en, excerpt_es, body_md_en, body_md_es
  on public.posts
  for each row execute function public.posts_set_search_vectors();

update public.posts
set title_en = title_en;

create index if not exists posts_search_vector_en_idx
  on public.posts using gin (search_vector_en)
  where status = 'published';

create index if not exists posts_search_vector_es_idx
  on public.posts using gin (search_vector_es)
  where status = 'published';

-- ---------------------------------------------------------------------------
-- Search vectors on post_series
-- ---------------------------------------------------------------------------
alter table public.post_series
  add column if not exists search_vector_en tsvector,
  add column if not exists search_vector_es tsvector;

create or replace function public.post_series_set_search_vectors()
returns trigger
language plpgsql
as $$
begin
  new.search_vector_en :=
    setweight(to_tsvector('english', coalesce(new.title_en, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description_en, '')), 'B');
  new.search_vector_es :=
    setweight(to_tsvector('spanish', coalesce(new.title_es, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.description_es, '')), 'B');
  return new;
end;
$$;

drop trigger if exists post_series_search_vectors on public.post_series;
create trigger post_series_search_vectors
  before insert or update of title_en, title_es, description_en, description_es
  on public.post_series
  for each row execute function public.post_series_set_search_vectors();

update public.post_series
set title_en = title_en;

create index if not exists post_series_search_vector_en_idx
  on public.post_series using gin (search_vector_en);

create index if not exists post_series_search_vector_es_idx
  on public.post_series using gin (search_vector_es);

-- ---------------------------------------------------------------------------
-- RPC: search published posts + series
-- ---------------------------------------------------------------------------
create or replace function public.search_published_content(
  search_query text,
  search_locale text default 'en',
  result_limit integer default 12
)
returns table (
  result_type text,
  id uuid,
  slug text,
  title text,
  excerpt text,
  category text,
  cover_image_url text,
  reading_time_minutes integer,
  published_at timestamptz,
  rank real
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  ts_cfg regconfig;
  ts_query tsquery;
  use_spanish boolean;
begin
  if length(trim(coalesce(search_query, ''))) < 2 then
    return;
  end if;

  use_spanish := search_locale = 'es';
  ts_cfg := case when use_spanish then 'spanish'::regconfig else 'english'::regconfig end;
  ts_query := plainto_tsquery(ts_cfg, search_query);

  return query
  select *
  from (
    (
      select
        'post'::text as result_type,
        p.id,
        case when use_spanish then p.slug_es else p.slug_en end as slug,
        case when use_spanish then p.title_es else p.title_en end as title,
        case when use_spanish then p.excerpt_es else p.excerpt_en end as excerpt,
        p.category,
        p.cover_image_url,
        p.reading_time_minutes,
        p.published_at,
        ts_rank(
          case when use_spanish then p.search_vector_es else p.search_vector_en end,
          ts_query
        )::real as rank
      from public.posts p
      where p.status = 'published'
        and (
          case
            when use_spanish then p.search_vector_es @@ ts_query
            else p.search_vector_en @@ ts_query
          end
        )
    )
    union all
    (
      select
        'series'::text as result_type,
        s.id,
        s.slug,
        case when use_spanish then s.title_es else s.title_en end as title,
        coalesce(
          case when use_spanish then s.description_es else s.description_en end,
          ''
        ) as excerpt,
        null::text as category,
        null::text as cover_image_url,
        null::integer as reading_time_minutes,
        s.updated_at as published_at,
        ts_rank(
          case when use_spanish then s.search_vector_es else s.search_vector_en end,
          ts_query
        )::real as rank
      from public.post_series s
      where exists (
        select 1
        from public.post_series_members m
        join public.posts p on p.id = m.post_id
        where m.series_id = s.id and p.status = 'published'
      )
      and (
        case
          when use_spanish then s.search_vector_es @@ ts_query
          else s.search_vector_en @@ ts_query
        end
      )
    )
  ) combined
  order by combined.rank desc
  limit greatest(1, least(result_limit, 50));
end;
$$;

grant execute on function public.search_published_content(text, text, integer) to anon, authenticated;

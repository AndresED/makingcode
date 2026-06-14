-- First-party page analytics (free, stored in Supabase)

create table public.page_view_events (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 500),
  referrer_host text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  session_id uuid not null,
  locale text check (locale is null or locale in ('en', 'es')),
  viewed_at timestamptz not null default now()
);

create index page_view_events_viewed_at_idx
  on public.page_view_events (viewed_at desc);

create index page_view_events_path_viewed_at_idx
  on public.page_view_events (path, viewed_at desc);

create index page_view_events_session_viewed_at_idx
  on public.page_view_events (session_id, viewed_at desc);

alter table public.page_view_events enable row level security;

-- ---------------------------------------------------------------------------
-- Public insert via RPC (no direct table access)
-- ---------------------------------------------------------------------------
create or replace function public.record_page_view(
  p_path text,
  p_session_id uuid,
  p_referrer_host text default null,
  p_country_code text default null,
  p_locale text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_path is null or length(trim(p_path)) < 1 or p_session_id is null then
    return;
  end if;

  insert into public.page_view_events (path, session_id, referrer_host, country_code, locale)
  values (
    left(trim(p_path), 500),
    p_session_id,
    nullif(left(trim(coalesce(p_referrer_host, '')), 120), ''),
    nullif(upper(left(trim(coalesce(p_country_code, '')), 2)), ''),
    case when p_locale in ('en', 'es') then p_locale else null end
  );
end;
$$;

grant execute on function public.record_page_view(text, uuid, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin read aggregates
-- ---------------------------------------------------------------------------
create or replace function public.analytics_summary(p_since timestamptz)
returns table (pageviews bigint, visitors bigint, visits bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    count(*)::bigint as pageviews,
    count(distinct e.session_id)::bigint as visitors,
    count(distinct (e.session_id, (e.viewed_at at time zone 'utc')::date))::bigint as visits
  from public.page_view_events e
  where e.viewed_at >= p_since;
end;
$$;

create or replace function public.analytics_top_pages(
  p_since timestamptz,
  p_limit integer default 12
)
returns table (path text, pageviews bigint, visitors bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    e.path,
    count(*)::bigint as pageviews,
    count(distinct e.session_id)::bigint as visitors
  from public.page_view_events e
  where e.viewed_at >= p_since
  group by e.path
  order by pageviews desc, visitors desc
  limit greatest(1, least(coalesce(p_limit, 12), 50));
end;
$$;

create or replace function public.analytics_top_referrers(
  p_since timestamptz,
  p_limit integer default 8
)
returns table (referrer_host text, pageviews bigint, visitors bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    coalesce(nullif(e.referrer_host, ''), '(direct)') as referrer_host,
    count(*)::bigint as pageviews,
    count(distinct e.session_id)::bigint as visitors
  from public.page_view_events e
  where e.viewed_at >= p_since
  group by 1
  order by visitors desc, pageviews desc
  limit greatest(1, least(coalesce(p_limit, 8), 50));
end;
$$;

create or replace function public.analytics_top_countries(
  p_since timestamptz,
  p_limit integer default 8
)
returns table (country_code text, pageviews bigint, visitors bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    coalesce(e.country_code, '—') as country_code,
    count(*)::bigint as pageviews,
    count(distinct e.session_id)::bigint as visitors
  from public.page_view_events e
  where e.viewed_at >= p_since
  group by e.country_code
  order by visitors desc, pageviews desc
  limit greatest(1, least(coalesce(p_limit, 8), 50));
end;
$$;

grant execute on function public.analytics_summary(timestamptz) to authenticated;
grant execute on function public.analytics_top_pages(timestamptz, integer) to authenticated;
grant execute on function public.analytics_top_referrers(timestamptz, integer) to authenticated;
grant execute on function public.analytics_top_countries(timestamptz, integer) to authenticated;

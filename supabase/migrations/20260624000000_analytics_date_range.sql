-- Analytics: optional end date (p_until) and higher limits for dashboard pagination

create or replace function public.analytics_summary(
  p_since timestamptz,
  p_until timestamptz default null
)
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
  where e.viewed_at >= p_since
    and (p_until is null or e.viewed_at < p_until);
end;
$$;

create or replace function public.analytics_top_pages(
  p_since timestamptz,
  p_limit integer default 12,
  p_until timestamptz default null
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
    and (p_until is null or e.viewed_at < p_until)
  group by e.path
  order by pageviews desc, visitors desc
  limit greatest(1, least(coalesce(p_limit, 12), 200));
end;
$$;

create or replace function public.analytics_top_referrers(
  p_since timestamptz,
  p_limit integer default 8,
  p_until timestamptz default null
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
    and (p_until is null or e.viewed_at < p_until)
  group by 1
  order by visitors desc, pageviews desc
  limit greatest(1, least(coalesce(p_limit, 8), 200));
end;
$$;

create or replace function public.analytics_top_countries(
  p_since timestamptz,
  p_limit integer default 8,
  p_until timestamptz default null
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
    and (p_until is null or e.viewed_at < p_until)
  group by e.country_code
  order by visitors desc, pageviews desc
  limit greatest(1, least(coalesce(p_limit, 8), 200));
end;
$$;

create or replace function public.analytics_public_top_blog_slugs(
  p_since timestamptz,
  p_limit integer default 20,
  p_until timestamptz default null
)
returns table (
  slug text,
  pageviews bigint,
  visitors bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    substring(e.path from '^/blog/([^/?#]+)') as slug,
    count(*)::bigint as pageviews,
    count(distinct e.session_id)::bigint as visitors
  from public.page_view_events e
  where e.viewed_at >= p_since
    and (p_until is null or e.viewed_at < p_until)
    and e.path ~ '^/blog/[^/?#]+$'
  group by 1
  having substring(e.path from '^/blog/([^/?#]+)') is not null
  order by pageviews desc, visitors desc
  limit greatest(1, least(coalesce(p_limit, 20), 200));
$$;

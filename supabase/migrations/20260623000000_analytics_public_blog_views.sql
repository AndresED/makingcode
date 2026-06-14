-- Public-safe aggregate: top blog post slugs by views (no PII)

create or replace function public.analytics_public_top_blog_slugs(
  p_since timestamptz,
  p_limit integer default 20
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
    and e.path ~ '^/blog/[^/?#]+$'
  group by 1
  having substring(e.path from '^/blog/([^/?#]+)') is not null
  order by pageviews desc, visitors desc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

grant execute on function public.analytics_public_top_blog_slugs(timestamptz, integer) to anon, authenticated;

-- Admin policies must not invoke is_admin() for anon (build + public reads).
-- Grant execute to authenticated only (RLS evaluation, not public RPC).

drop policy if exists "posts_admin_all" on public.posts;

create policy "posts_admin_select"
  on public.posts for select
  to authenticated
  using (public.is_admin());

create policy "posts_admin_insert"
  on public.posts for insert
  to authenticated
  with check (public.is_admin());

create policy "posts_admin_update"
  on public.posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "posts_admin_delete"
  on public.posts for delete
  to authenticated
  using (public.is_admin());

grant execute on function public.is_admin() to authenticated;

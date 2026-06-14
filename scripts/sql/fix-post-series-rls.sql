-- Hotfix: run in Supabase SQL Editor if home page fails with
-- "permission denied for function is_admin" on post_series_members.
-- See supabase/migrations/20260620000000_fix_post_series_rls.sql

drop policy if exists "post_series_admin_all" on public.post_series;

create policy "post_series_admin_select"
  on public.post_series for select
  to authenticated
  using (public.is_admin());

create policy "post_series_admin_insert"
  on public.post_series for insert
  to authenticated
  with check (public.is_admin());

create policy "post_series_admin_update"
  on public.post_series for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "post_series_admin_delete"
  on public.post_series for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "post_series_members_admin_all" on public.post_series_members;

create policy "post_series_members_admin_select"
  on public.post_series_members for select
  to authenticated
  using (public.is_admin());

create policy "post_series_members_admin_insert"
  on public.post_series_members for insert
  to authenticated
  with check (public.is_admin());

create policy "post_series_members_admin_update"
  on public.post_series_members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "post_series_members_admin_delete"
  on public.post_series_members for delete
  to authenticated
  using (public.is_admin());

grant execute on function public.is_admin() to authenticated;

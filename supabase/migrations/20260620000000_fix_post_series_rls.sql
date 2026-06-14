-- Align post_series RLS with posts: admin policies scoped to authenticated only.
-- Prevents anon/public reads from evaluating is_admin() (permission denied).

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

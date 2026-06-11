-- Storage policies for the existing public "makingcode" bucket (cover uploads).
-- Uploads are performed server-side with service role after admin auth;
-- these policies allow optional direct admin uploads from the dashboard client.

create policy "makingcode_public_read"
  on storage.objects for select
  using (bucket_id = 'makingcode');

create policy "makingcode_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'makingcode' and public.is_admin());

create policy "makingcode_admin_update"
  on storage.objects for update
  using (bucket_id = 'makingcode' and public.is_admin());

create policy "makingcode_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'makingcode' and public.is_admin());

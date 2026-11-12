-- The tables were created, but the Data API roles did not have table grants.
-- The mobile app uses the publishable/anon key, so these grants are required
-- in addition to the RLS policies.
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.profiles to anon, authenticated;
grant select, insert, update on table public.settings to anon, authenticated;
grant select, insert, update on table public.meals to anon, authenticated;

-- Ensure the bucket used by the app exists in environments where schema.sql
-- was not run completely.
insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do update set public = true;

grant usage on schema storage to anon, authenticated;
grant select, insert, update on table storage.objects to anon, authenticated;

drop policy if exists "public upload meal images" on storage.objects;
drop policy if exists "public read meal images" on storage.objects;
drop policy if exists "public update meal images" on storage.objects;

create policy "public upload meal images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'meal-images');

create policy "public read meal images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'meal-images');

create policy "public update meal images"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'meal-images')
  with check (bucket_id = 'meal-images');

-- Attach the existing app data to Supabase Auth users.
alter table public.profiles add column if not exists user_id uuid;
alter table public.settings add column if not exists user_id uuid;
alter table public.meals add column if not exists user_id uuid;

do $$
begin
  alter table public.profiles
    add constraint profiles_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.settings
    add constraint settings_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.meals
    add constraint meals_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null;
end $$;

create unique index if not exists profiles_user_id_key
  on public.profiles(user_id) where user_id is not null;
create unique index if not exists settings_user_id_key
  on public.settings(user_id) where user_id is not null;
create index if not exists meals_user_id_created_at_idx
  on public.meals(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.meals enable row level security;

drop policy if exists "public read profiles" on public.profiles;
drop policy if exists "public write profiles" on public.profiles;
drop policy if exists "public update profiles" on public.profiles;
drop policy if exists "public read settings" on public.settings;
drop policy if exists "public write settings" on public.settings;
drop policy if exists "public update settings" on public.settings;
drop policy if exists "public read meals" on public.meals;
drop policy if exists "public write meals" on public.meals;
drop policy if exists "public update meals" on public.meals;

create policy "users read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users insert own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users read own settings"
  on public.settings for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users insert own settings"
  on public.settings for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "users update own settings"
  on public.settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users read own meals"
  on public.meals for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users insert own meals"
  on public.meals for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "users update own meals"
  on public.meals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles, public.settings, public.meals to authenticated;
revoke all on public.profiles, public.settings, public.meals from anon;

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', false)
on conflict (id) do update set public = false;

drop policy if exists "public upload meal images" on storage.objects;
drop policy if exists "public read meal images" on storage.objects;
drop policy if exists "public update meal images" on storage.objects;
drop policy if exists "users upload own meal images" on storage.objects;
drop policy if exists "users read own meal images" on storage.objects;
drop policy if exists "users update own meal images" on storage.objects;

create policy "users upload own meal images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users read own meal images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "users update own meal images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

grant usage on schema storage to authenticated;
grant select, insert, update on storage.objects to authenticated;
revoke all on storage.objects from anon;

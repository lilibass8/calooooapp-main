-- CalorieSnap: repair for "تعذر الحفظ" / PostgREST 42703.
-- Run this whole file in Supabase SQL Editor as project owner.
-- Safe to run more than once.

create table if not exists public.profiles (
  id uuid primary key,
  name text not null default '', weight_kg numeric not null default 0,
  height_cm numeric not null default 0, daily_calorie_goal numeric not null default 2000
);
create table if not exists public.settings (
  profile_id uuid primary key, dark_mode boolean not null default false,
  notifications_enabled boolean not null default true
);
create table if not exists public.meals (
  id text primary key, profile_id uuid, calories numeric not null default 0,
  image_path text not null default '', image_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists user_id uuid;
alter table public.settings add column if not exists user_id uuid;
alter table public.meals add column if not exists user_id uuid;
alter table public.meals add column if not exists category text;
alter table public.meals add column if not exists portion text;
alter table public.meals add column if not exists estimation_source text;

-- Reconnect old rows when their existing profile id is also an Auth user id.
update public.profiles p set user_id = p.id
where p.user_id is null and exists (select 1 from auth.users u where u.id = p.id);
update public.settings s set user_id = s.profile_id
where s.user_id is null and exists (select 1 from auth.users u where u.id = s.profile_id);
update public.meals m set user_id = m.profile_id
where m.user_id is null and exists (select 1 from auth.users u where u.id = m.profile_id);

do $$ begin
  alter table public.profiles add constraint profiles_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.settings add constraint settings_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.meals add constraint meals_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then null; end $$;

create unique index if not exists profiles_user_id_key on public.profiles(user_id) where user_id is not null;
create unique index if not exists settings_user_id_key on public.settings(user_id) where user_id is not null;
create index if not exists meals_user_id_created_at_idx on public.meals(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.meals enable row level security;

drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users insert own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "users read own settings" on public.settings;
drop policy if exists "users insert own settings" on public.settings;
drop policy if exists "users update own settings" on public.settings;
create policy "users read own settings" on public.settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own settings" on public.settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own settings" on public.settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "users read own meals" on public.meals;
drop policy if exists "users insert own meals" on public.meals;
drop policy if exists "users update own meals" on public.meals;
create policy "users read own meals" on public.meals for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own meals" on public.meals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own meals" on public.meals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles, public.settings, public.meals to authenticated;
revoke all on public.profiles, public.settings, public.meals from anon;

insert into storage.buckets (id, name, public) values ('meal-images', 'meal-images', false)
on conflict (id) do update set public = false;
drop policy if exists "users upload own meal images" on storage.objects;
drop policy if exists "users read own meal images" on storage.objects;
drop policy if exists "users update own meal images" on storage.objects;
create policy "users upload own meal images" on storage.objects for insert to authenticated
  with check (bucket_id = 'meal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users read own meal images" on storage.objects for select to authenticated
  using (bucket_id = 'meal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users update own meal images" on storage.objects for update to authenticated
  using (bucket_id = 'meal-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'meal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
grant usage on schema storage to authenticated;
grant select, insert, update on storage.objects to authenticated;
revoke all on storage.objects from anon;

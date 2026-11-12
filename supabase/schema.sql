create table if not exists public.profiles (
  id text primary key,
  name text not null,
  weight_kg integer not null,
  height_cm integer not null,
  daily_calorie_goal integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  profile_id text primary key references public.profiles(id) on delete cascade,
  dark_mode boolean not null default false,
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.meals (
  id text primary key,
  profile_id text not null references public.profiles(id) on delete cascade,
  calories integer not null,
  image_path text not null,
  image_url text not null,
  category text,
  portion text,
  estimation_source text,
  created_at timestamptz not null,
  inserted_at timestamptz not null default now()
);

alter table public.meals
  add column if not exists category text,
  add column if not exists portion text,
  add column if not exists estimation_source text;

create index if not exists meals_profile_created_at_idx
  on public.meals(profile_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.meals enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.profiles to anon, authenticated;
grant select, insert, update on table public.settings to anon, authenticated;
grant select, insert, update on table public.meals to anon, authenticated;

-- This app currently uses a device-generated profile ID (no auth).
-- Keep these permissive while bootstrapping; tighten later when auth is added.
create policy "public read profiles"
  on public.profiles for select using (true);
create policy "public write profiles"
  on public.profiles for insert with check (true);
create policy"public update profiles"
  on public.profiles for update using (true);

create policy "public read settings"
  on public.settings for select using (true);
create policy "public write settings"
  on public.settings for insert with check (true);
create policy "public update settings"
  on public.settings for update using (true);

create policy "public read meals"
  on public.meals for select using (true);
create policy "public write meals"
  on public.meals for insert with check (true);
create policy "public update meals"
  on public.meals for update using (true);

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;

create policy "public upload meal images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'meal-images');

create policy "public read meal images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'meal-images');

grant usage on schema storage to anon, authenticated;
grant select, insert, update on table storage.objects to anon, authenticated;

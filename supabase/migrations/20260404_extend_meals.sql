alter table public.meals
  add column if not exists category text,
  add column if not exists portion text,
  add column if not exists estimation_source text;

alter table public.profiles
add column if not exists phone text,
add column if not exists avatar_url text,
add column if not exists pin_hash text;

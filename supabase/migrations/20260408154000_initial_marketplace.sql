create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  city text,
  barangay text,
  bio text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  jobs_completed integer not null default 0,
  response_rate integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'gig_status') then
    create type public.gig_status as enum (
      'draft',
      'published',
      'shortlisting',
      'funded',
      'in_progress',
      'completed',
      'disputed',
      'cancelled',
      'closed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'submitted',
      'shortlisted',
      'rejected',
      'withdrawn',
      'hired',
      'closed'
    );
  end if;
end
$$;

create table if not exists public.gig_posts (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  price_amount integer not null check (price_amount > 0),
  currency text not null default 'PHP',
  duration_bucket text not null,
  city text not null,
  barangay text not null,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  schedule_summary text not null,
  supervisor_present boolean not null default false,
  ppe_provided boolean not null default false,
  helper_only_confirmation boolean not null default false,
  physical_load text,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.gig_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gig_applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gig_posts (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  intro text not null,
  availability text not null,
  status public.application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gig_id, worker_id)
);

create index if not exists gig_posts_status_created_at_idx
  on public.gig_posts (status, created_at desc);

create index if not exists gig_posts_category_city_idx
  on public.gig_posts (category, city);

create index if not exists gig_applications_worker_created_at_idx
  on public.gig_applications (worker_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1),
      'Raket User'
    )
  )
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_stats_updated_at on public.user_stats;
create trigger set_user_stats_updated_at
before update on public.user_stats
for each row execute procedure public.set_updated_at();

drop trigger if exists set_gig_posts_updated_at on public.gig_posts;
create trigger set_gig_posts_updated_at
before update on public.gig_posts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_gig_applications_updated_at on public.gig_applications;
create trigger set_gig_applications_updated_at
before update on public.gig_applications
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.gig_posts enable row level security;
alter table public.gig_applications enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "user_stats_select_authenticated" on public.user_stats;
create policy "user_stats_select_authenticated"
on public.user_stats
for select
to authenticated
using (true);

drop policy if exists "gig_posts_select_authenticated" on public.gig_posts;
create policy "gig_posts_select_authenticated"
on public.gig_posts
for select
to authenticated
using (true);

drop policy if exists "gig_posts_insert_own" on public.gig_posts;
create policy "gig_posts_insert_own"
on public.gig_posts
for insert
to authenticated
with check (auth.uid() = poster_id);

drop policy if exists "gig_posts_update_own" on public.gig_posts;
create policy "gig_posts_update_own"
on public.gig_posts
for update
to authenticated
using (auth.uid() = poster_id)
with check (auth.uid() = poster_id);

drop policy if exists "gig_applications_select_related" on public.gig_applications;
create policy "gig_applications_select_related"
on public.gig_applications
for select
to authenticated
using (
  auth.uid() = worker_id
  or exists (
    select 1
    from public.gig_posts gp
    where gp.id = gig_id
      and gp.poster_id = auth.uid()
  )
);

drop policy if exists "gig_applications_insert_own" on public.gig_applications;
create policy "gig_applications_insert_own"
on public.gig_applications
for insert
to authenticated
with check (
  auth.uid() = worker_id
  and exists (
    select 1
    from public.gig_posts gp
    where gp.id = gig_id
      and gp.poster_id <> auth.uid()
      and gp.status in ('published', 'shortlisting')
  )
);

drop policy if exists "gig_applications_update_own_or_poster" on public.gig_applications;
create policy "gig_applications_update_own_or_poster"
on public.gig_applications
for update
to authenticated
using (
  auth.uid() = worker_id
  or exists (
    select 1
    from public.gig_posts gp
    where gp.id = gig_id
      and gp.poster_id = auth.uid()
  )
)
with check (
  auth.uid() = worker_id
  or exists (
    select 1
    from public.gig_posts gp
    where gp.id = gig_id
      and gp.poster_id = auth.uid()
  )
);

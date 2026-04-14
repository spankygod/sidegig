do $$
begin
  if not exists (select 1 from pg_type where typname = 'hire_status') then
    create type public.hire_status as enum (
      'pending_funding',
      'funded',
      'accepted',
      'in_progress',
      'worker_marked_done',
      'poster_accepted',
      'disputed',
      'refunded',
      'payout_ready',
      'paid_out'
    );
  end if;
end
$$;

create table if not exists public.hires (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gig_posts (id) on delete cascade,
  application_id uuid not null references public.gig_applications (id) on delete cascade,
  poster_id uuid not null references auth.users (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  status public.hire_status not null default 'funded',
  funded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gig_id),
  unique (application_id)
);

create index if not exists hires_poster_status_idx
  on public.hires (poster_id, status);

create index if not exists hires_worker_status_idx
  on public.hires (worker_id, status);

drop trigger if exists set_hires_updated_at on public.hires;
create trigger set_hires_updated_at
before update on public.hires
for each row execute procedure public.set_updated_at();

alter table public.hires enable row level security;

drop policy if exists "hires_select_related" on public.hires;
create policy "hires_select_related"
on public.hires
for select
to authenticated
using (
  auth.uid() = poster_id
  or auth.uid() = worker_id
);

drop policy if exists "hires_insert_poster" on public.hires;
create policy "hires_insert_poster"
on public.hires
for insert
to authenticated
with check (
  auth.uid() = poster_id
  and exists (
    select 1
    from public.gig_posts gp
    where gp.id = gig_id
      and gp.poster_id = auth.uid()
  )
  and exists (
    select 1
    from public.gig_applications ga
    where ga.id = application_id
      and ga.gig_id = gig_id
      and ga.worker_id = worker_id
  )
);

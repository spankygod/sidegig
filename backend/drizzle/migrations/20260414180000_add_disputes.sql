do $$
begin
  if not exists (select 1 from pg_type where typname = 'dispute_status') then
    create type public.dispute_status as enum (
      'open',
      'under_review',
      'resolved',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  opened_by uuid not null references auth.users (id) on delete cascade,
  poster_id uuid not null references auth.users (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  details text,
  status public.dispute_status not null default 'open',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hire_id)
);

create index if not exists disputes_poster_status_idx
  on public.disputes (poster_id, status);

create index if not exists disputes_worker_status_idx
  on public.disputes (worker_id, status);

create index if not exists disputes_opened_by_idx
  on public.disputes (opened_by);

drop trigger if exists set_disputes_updated_at on public.disputes;
create trigger set_disputes_updated_at
before update on public.disputes
for each row execute procedure public.set_updated_at();

alter table public.disputes enable row level security;

drop policy if exists "disputes_select_related" on public.disputes;
create policy "disputes_select_related"
on public.disputes
for select
to authenticated
using (
  auth.uid() = poster_id
  or auth.uid() = worker_id
);

drop policy if exists "disputes_insert_poster" on public.disputes;
create policy "disputes_insert_poster"
on public.disputes
for insert
to authenticated
with check (
  auth.uid() = opened_by
  and opened_by = poster_id
  and exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and h.poster_id = poster_id
      and h.worker_id = worker_id
      and h.status = 'worker_marked_done'
  )
);

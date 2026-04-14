do $$
begin
  if not exists (select 1 from pg_type where typname = 'hire_milestone_status') then
    create type public.hire_milestone_status as enum (
      'pending',
      'in_progress',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.hire_milestones (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status public.hire_milestone_status not null default 'pending',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hire_milestones_hire_status_idx
  on public.hire_milestones (hire_id, status);

create index if not exists hire_milestones_created_by_idx
  on public.hire_milestones (created_by);

drop trigger if exists set_hire_milestones_updated_at on public.hire_milestones;
create trigger set_hire_milestones_updated_at
before update on public.hire_milestones
for each row execute procedure public.set_updated_at();

alter table public.hire_milestones enable row level security;

drop policy if exists "hire_milestones_select_related" on public.hire_milestones;
create policy "hire_milestones_select_related"
on public.hire_milestones
for select
to authenticated
using (
  exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and (h.poster_id = auth.uid() or h.worker_id = auth.uid())
  )
);

drop policy if exists "hire_milestones_insert_poster" on public.hire_milestones;
create policy "hire_milestones_insert_poster"
on public.hire_milestones
for insert
to authenticated
with check (
  auth.uid() = created_by
  and exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and h.poster_id = auth.uid()
      and h.status in ('funded', 'accepted', 'in_progress', 'worker_marked_done')
  )
);

drop policy if exists "hire_milestones_update_related" on public.hire_milestones;
create policy "hire_milestones_update_related"
on public.hire_milestones
for update
to authenticated
using (
  exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and (h.poster_id = auth.uid() or h.worker_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and (h.poster_id = auth.uid() or h.worker_id = auth.uid())
  )
);

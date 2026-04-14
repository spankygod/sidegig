do $$
begin
  if not exists (select 1 from pg_type where typname = 'chat_thread_context') then
    create type public.chat_thread_context as enum (
      'application',
      'hire'
    );
  end if;
end
$$;

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  context_type public.chat_thread_context not null,
  application_id uuid references public.gig_applications (id) on delete cascade,
  hire_id uuid references public.hires (id) on delete cascade,
  poster_id uuid not null references auth.users (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id),
  unique (hire_id),
  check (
    (context_type = 'application' and application_id is not null and hire_id is null)
    or (context_type = 'hire' and hire_id is not null and application_id is null)
  )
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_threads_poster_updated_at_idx
  on public.chat_threads (poster_id, updated_at desc);

create index if not exists chat_threads_worker_updated_at_idx
  on public.chat_threads (worker_id, updated_at desc);

create index if not exists chat_messages_thread_created_at_idx
  on public.chat_messages (thread_id, created_at desc);

create index if not exists chat_messages_sender_created_at_idx
  on public.chat_messages (sender_id, created_at desc);

drop trigger if exists set_chat_threads_updated_at on public.chat_threads;
create trigger set_chat_threads_updated_at
before update on public.chat_threads
for each row execute procedure public.set_updated_at();

alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_threads_select_related" on public.chat_threads;
create policy "chat_threads_select_related"
on public.chat_threads
for select
to authenticated
using (
  auth.uid() = poster_id
  or auth.uid() = worker_id
);

drop policy if exists "chat_threads_insert_related" on public.chat_threads;
create policy "chat_threads_insert_related"
on public.chat_threads
for insert
to authenticated
with check (
  auth.uid() = poster_id
  or auth.uid() = worker_id
);

drop policy if exists "chat_messages_select_related" on public.chat_messages;
create policy "chat_messages_select_related"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_threads ct
    where ct.id = thread_id
      and (auth.uid() = ct.poster_id or auth.uid() = ct.worker_id)
  )
);

drop policy if exists "chat_messages_insert_related" on public.chat_messages;
create policy "chat_messages_insert_related"
on public.chat_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.chat_threads ct
    where ct.id = thread_id
      and (auth.uid() = ct.poster_id or auth.uid() = ct.worker_id)
  )
);

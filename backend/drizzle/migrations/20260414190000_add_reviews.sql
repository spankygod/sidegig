create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  reviewee_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_hire_id_reviewer_id_unique unique (hire_id, reviewer_id),
  constraint reviews_reviewer_reviewee_check check (reviewer_id <> reviewee_id)
);

create index if not exists reviews_reviewee_created_at_idx
  on public.reviews (reviewee_id, created_at desc);

create index if not exists reviews_reviewer_created_at_idx
  on public.reviews (reviewer_id, created_at desc);

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute procedure public.set_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_authenticated" on public.reviews;
create policy "reviews_select_authenticated"
on public.reviews
for select
to authenticated
using (true);

drop policy if exists "reviews_insert_completed_hire_participant" on public.reviews;
create policy "reviews_insert_completed_hire_participant"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = reviewer_id
  and exists (
    select 1
    from public.hires h
    where h.id = hire_id
      and h.status in ('poster_accepted', 'payout_ready', 'paid_out')
      and (
        (h.poster_id = reviewer_id and h.worker_id = reviewee_id)
        or (h.worker_id = reviewer_id and h.poster_id = reviewee_id)
      )
  )
);

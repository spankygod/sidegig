do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'paid',
      'refunded',
      'failed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type public.payout_status as enum (
      'pending',
      'paid',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  payer_id uuid not null references auth.users (id) on delete cascade,
  payee_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount > 0),
  currency text not null default 'PHP',
  status public.payment_status not null default 'paid',
  provider text not null default 'manual',
  provider_reference text,
  paid_at timestamptz not null default now(),
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_hire_id_unique unique (hire_id)
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires (id) on delete cascade,
  payment_id uuid not null references public.payments (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount > 0),
  currency text not null default 'PHP',
  status public.payout_status not null default 'pending',
  provider_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payouts_hire_id_unique unique (hire_id)
);

create index if not exists payments_payer_created_at_idx
  on public.payments (payer_id, created_at desc);

create index if not exists payments_payee_created_at_idx
  on public.payments (payee_id, created_at desc);

create index if not exists payouts_status_created_at_idx
  on public.payouts (status, created_at desc);

create index if not exists payouts_worker_status_idx
  on public.payouts (worker_id, status);

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute procedure public.set_updated_at();

drop trigger if exists set_payouts_updated_at on public.payouts;
create trigger set_payouts_updated_at
before update on public.payouts
for each row execute procedure public.set_updated_at();

alter table public.payments enable row level security;
alter table public.payouts enable row level security;

drop policy if exists "payments_select_related" on public.payments;
create policy "payments_select_related"
on public.payments
for select
to authenticated
using (
  auth.uid() = payer_id
  or auth.uid() = payee_id
);

drop policy if exists "payouts_select_worker" on public.payouts;
create policy "payouts_select_worker"
on public.payouts
for select
to authenticated
using (auth.uid() = worker_id);

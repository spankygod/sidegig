drop policy if exists "gig_applications_insert_own" on public.gig_applications;

do $$
begin
  if exists (select 1 from pg_type where typname = 'gig_status') then
    update public.gig_posts
    set status = 'published'
    where status::text = 'shortlisting';

    alter table public.gig_posts
      alter column status drop default;

    alter type public.gig_status rename to gig_status_old;

    create type public.gig_status as enum (
      'draft',
      'published',
      'funded',
      'in_progress',
      'completed',
      'disputed',
      'cancelled',
      'closed'
    );

    alter table public.gig_posts
      alter column status type public.gig_status
      using status::text::public.gig_status;

    alter table public.gig_posts
      alter column status set default 'published';

    drop type public.gig_status_old;
  end if;

  if exists (select 1 from pg_type where typname = 'application_status') then
    update public.gig_applications
    set status = 'submitted'
    where status::text = 'shortlisted';

    alter table public.gig_applications
      alter column status drop default;

    alter type public.application_status rename to application_status_old;

    create type public.application_status as enum (
      'submitted',
      'rejected',
      'withdrawn',
      'hired',
      'closed'
    );

    alter table public.gig_applications
      alter column status type public.application_status
      using status::text::public.application_status;

    alter table public.gig_applications
      alter column status set default 'submitted';

    drop type public.application_status_old;
  end if;
end
$$;

create policy "gig_applications_insert_own"
on public.gig_applications
for insert
to authenticated
with check (
  auth.uid() = worker_id
  and exists (
    select 1
    from public.gig_posts gp
    inner join public.profiles p on p.id = auth.uid()
    where gp.id = gig_id
      and gp.poster_id <> auth.uid()
      and gp.status = 'published'
      and p.latitude is not null
      and p.longitude is not null
      and public.calculate_distance_km(
        p.latitude,
        p.longitude,
        gp.latitude,
        gp.longitude
      ) <= least(
        p.service_radius_km::double precision,
        gp.application_radius_km::double precision
      )
  )
);

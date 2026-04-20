alter table public.gig_posts
  drop column if exists supervisor_present,
  drop column if exists ppe_provided,
  drop column if exists helper_only_confirmation,
  drop column if exists physical_load;

alter table public.user_stats
  add column if not exists gigs_posted integer not null default 0,
  add column if not exists hires_funded integer not null default 0,
  add column if not exists hires_completed integer not null default 0;

update public.user_stats us
set gigs_posted = counts.gigs_posted
from (
  select gp.poster_id, count(*)::int as gigs_posted
  from public.gig_posts gp
  group by gp.poster_id
) counts
where us.user_id = counts.poster_id;

update public.user_stats us
set hires_funded = counts.hires_funded
from (
  select h.poster_id, count(*)::int as hires_funded
  from public.hires h
  group by h.poster_id
) counts
where us.user_id = counts.poster_id;

update public.user_stats us
set hires_completed = counts.hires_completed
from (
  select h.poster_id, count(*)::int as hires_completed
  from public.hires h
  where h.status in ('payout_ready', 'paid_out')
  group by h.poster_id
) counts
where us.user_id = counts.poster_id;

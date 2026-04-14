import type { DatabaseError, Pool } from 'pg'
import type {
  CreateGigApplicationInput,
  GigApplicationSummary,
  PosterGigApplicationSummary,
  ReviewableApplicationStatus
} from './types'

type ApplicationRow = {
  id: string
  status: GigApplicationSummary['status']
  intro: string
  availability: string
  created_at: Date | string
  gig_id: string
  gig_title: string
  gig_category: string
  gig_city: string
  gig_barangay: string
  gig_status: string
}

type PosterApplicationRow = {
  id: string
  status: PosterGigApplicationSummary['status']
  intro: string
  availability: string
  created_at: Date | string
  updated_at: Date | string
  worker_id: string
  worker_display_name: string
  worker_city: string | null
  worker_barangay: string | null
  worker_bio: string | null
  worker_skills: string[] | null
  worker_rating: string | number | null
  worker_review_count: number | null
  worker_jobs_completed: number | null
  worker_response_rate: number | null
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapApplication (row: ApplicationRow): GigApplicationSummary {
  return {
    id: row.id,
    status: row.status,
    intro: row.intro,
    availability: row.availability,
    createdAt: toIsoString(row.created_at),
    gig: {
      id: row.gig_id,
      title: row.gig_title,
      category: row.gig_category,
      city: row.gig_city,
      barangay: row.gig_barangay,
      status: row.gig_status
    }
  }
}

function mapPosterApplication (row: PosterApplicationRow): PosterGigApplicationSummary {
  return {
    id: row.id,
    status: row.status,
    intro: row.intro,
    availability: row.availability,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    worker: {
      id: row.worker_id,
      displayName: row.worker_display_name,
      city: row.worker_city,
      barangay: row.worker_barangay,
      bio: row.worker_bio,
      skills: row.worker_skills ?? [],
      stats: {
        rating: Number(row.worker_rating ?? 0),
        reviewCount: row.worker_review_count ?? 0,
        jobsCompleted: row.worker_jobs_completed ?? 0,
        responseRate: row.worker_response_rate ?? 0
      }
    }
  }
}

function posterApplicationSelect (): string {
  return `
    select
      ga.id,
      ga.status,
      ga.intro,
      ga.availability,
      ga.created_at,
      ga.updated_at,
      p.id as worker_id,
      p.display_name as worker_display_name,
      p.city as worker_city,
      p.barangay as worker_barangay,
      p.bio as worker_bio,
      p.skills as worker_skills,
      us.rating as worker_rating,
      us.review_count as worker_review_count,
      us.jobs_completed as worker_jobs_completed,
      us.response_rate as worker_response_rate
    from public.gig_applications ga
    inner join public.gig_posts g on g.id = ga.gig_id
    inner join public.profiles p on p.id = ga.worker_id
    left join public.user_stats us on us.user_id = p.id
  `
}

export function isUniqueViolation (error: unknown): error is DatabaseError {
  return typeof error === 'object' && error != null && 'code' in error && error.code === '23505'
}

export async function createGigApplication (
  db: Pool,
  workerId: string,
  input: CreateGigApplicationInput
): Promise<GigApplicationSummary> {
  const result = await db.query<ApplicationRow>(
    `
      with inserted as (
        insert into public.gig_applications (
          gig_id,
          worker_id,
          intro,
          availability
        )
        values ($1, $2, $3, $4)
        returning *
      )
      select
        inserted.id,
        inserted.status,
        inserted.intro,
        inserted.availability,
        inserted.created_at,
        g.id as gig_id,
        g.title as gig_title,
        g.category as gig_category,
        g.city as gig_city,
        g.barangay as gig_barangay,
        g.status as gig_status
      from inserted
      inner join public.gig_posts g on g.id = inserted.gig_id
    `,
    [input.gigId, workerId, input.intro, input.availability]
  )

  return mapApplication(result.rows[0])
}

export async function listWorkerApplications (
  db: Pool,
  workerId: string
): Promise<GigApplicationSummary[]> {
  const result = await db.query<ApplicationRow>(
    `
      select
        ga.id,
        ga.status,
        ga.intro,
        ga.availability,
        ga.created_at,
        g.id as gig_id,
        g.title as gig_title,
        g.category as gig_category,
        g.city as gig_city,
        g.barangay as gig_barangay,
        g.status as gig_status
      from public.gig_applications ga
      inner join public.gig_posts g on g.id = ga.gig_id
      where ga.worker_id = $1
      order by ga.created_at desc
    `,
    [workerId]
  )

  return result.rows.map(mapApplication)
}

export async function getWorkerApplicationById (
  db: Pool,
  input: {
    applicationId: string
    workerId: string
  }
): Promise<GigApplicationSummary | null> {
  const result = await db.query<ApplicationRow>(
    `
      select
        ga.id,
        ga.status,
        ga.intro,
        ga.availability,
        ga.created_at,
        g.id as gig_id,
        g.title as gig_title,
        g.category as gig_category,
        g.city as gig_city,
        g.barangay as gig_barangay,
        g.status as gig_status
      from public.gig_applications ga
      inner join public.gig_posts g on g.id = ga.gig_id
      where ga.id = $1
        and ga.worker_id = $2
    `,
    [input.applicationId, input.workerId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapApplication(result.rows[0])
}

export async function withdrawWorkerApplication (
  db: Pool,
  input: {
    applicationId: string
    workerId: string
  }
): Promise<GigApplicationSummary | null> {
  const result = await db.query<ApplicationRow>(
    `
      with updated as (
        update public.gig_applications
        set status = 'withdrawn'
        where id = $1
          and worker_id = $2
          and status = 'submitted'
        returning *
      )
      select
        updated.id,
        updated.status,
        updated.intro,
        updated.availability,
        updated.created_at,
        g.id as gig_id,
        g.title as gig_title,
        g.category as gig_category,
        g.city as gig_city,
        g.barangay as gig_barangay,
        g.status as gig_status
      from updated
      inner join public.gig_posts g on g.id = updated.gig_id
    `,
    [input.applicationId, input.workerId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapApplication(result.rows[0])
}

export async function listGigApplicationsForPoster (
  db: Pool,
  posterId: string,
  gigId: string
): Promise<PosterGigApplicationSummary[]> {
  const result = await db.query<PosterApplicationRow>(
    `
      ${posterApplicationSelect()}
      where g.poster_id = $1
        and ga.gig_id = $2
      order by
        case ga.status
          when 'submitted' then 0
          when 'rejected' then 1
          else 2
        end,
        ga.created_at desc
    `,
    [posterId, gigId]
  )

  return result.rows.map(mapPosterApplication)
}

export async function reviewGigApplication (
  db: Pool,
  input: {
    posterId: string
    gigId: string
    applicationId: string
    status: ReviewableApplicationStatus
  }
): Promise<PosterGigApplicationSummary | null> {
  const result = await db.query<PosterApplicationRow>(
    `
      with updated as (
        update public.gig_applications ga
        set status = $4
        where ga.id = $1
          and ga.gig_id = $2
          and ga.status not in ('withdrawn', 'hired', 'closed')
          and exists (
            select 1
            from public.gig_posts gp
            where gp.id = ga.gig_id
              and gp.poster_id = $3
              and gp.status = 'published'
          )
        returning ga.id
      )
      ${posterApplicationSelect()}
      where g.poster_id = $3
        and ga.gig_id = $2
        and ga.id = $1
        and exists (select 1 from updated)
    `,
    [input.applicationId, input.gigId, input.posterId, input.status]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapPosterApplication(result.rows[0])
}

export async function closeOpenApplicationsForGig (
  db: Pool,
  posterId: string,
  gigId: string
): Promise<void> {
  await db.query(
    `
      update public.gig_applications ga
      set status = 'closed'
      where ga.gig_id = $1
        and ga.status = 'submitted'
        and exists (
          select 1
          from public.gig_posts gp
          where gp.id = ga.gig_id
            and gp.poster_id = $2
        )
    `,
    [gigId, posterId]
  )
}

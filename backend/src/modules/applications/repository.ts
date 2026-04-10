import type { DatabaseError, Pool } from 'pg'
import type { CreateGigApplicationInput, GigApplicationSummary } from './types'

type ApplicationRow = {
  id: string
  status: string
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

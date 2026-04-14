import type { Pool } from 'pg'
import type { HireSummary } from './types'

type HireRow = {
  id: string
  gig_id: string
  application_id: string
  poster_id: string
  worker_id: string
  status: HireSummary['status']
  funded_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapHire (row: HireRow): HireSummary {
  return {
    id: row.id,
    gigId: row.gig_id,
    applicationId: row.application_id,
    posterId: row.poster_id,
    workerId: row.worker_id,
    status: row.status,
    fundedAt: row.funded_at == null ? null : toIsoString(row.funded_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

export async function fundGigHire (
  db: Pool,
  input: {
    posterId: string
    gigId: string
    applicationId: string
  }
): Promise<HireSummary | null> {
  const client = await db.connect()

  try {
    await client.query('begin')

    const eligibilityResult = await client.query<{
      gig_id: string
      application_id: string
      worker_id: string
    }>(
      `
        select
          gp.id as gig_id,
          ga.id as application_id,
          ga.worker_id
        from public.gig_posts gp
        inner join public.gig_applications ga on ga.gig_id = gp.id
        where gp.id = $1
          and gp.poster_id = $2
          and gp.status = 'published'
          and ga.id = $3
          and ga.status = 'submitted'
        for update of gp, ga
      `,
      [input.gigId, input.posterId, input.applicationId]
    )

    if (eligibilityResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const eligible = eligibilityResult.rows[0]

    await client.query(
      `
        update public.gig_applications
        set status = 'hired'
        where id = $1
      `,
      [input.applicationId]
    )

    await client.query(
      `
        update public.gig_applications
        set status = 'closed'
        where gig_id = $1
          and id <> $2
          and status in ('submitted', 'rejected')
      `,
      [input.gigId, input.applicationId]
    )

    await client.query(
      `
        update public.gig_posts
        set status = 'funded'
        where id = $1
      `,
      [input.gigId]
    )

    const hireResult = await client.query<HireRow>(
      `
        insert into public.hires (
          gig_id,
          application_id,
          poster_id,
          worker_id,
          status,
          funded_at
        )
        values ($1, $2, $3, $4, 'funded', now())
        returning
          id,
          gig_id,
          application_id,
          poster_id,
          worker_id,
          status,
          funded_at,
          created_at,
          updated_at
      `,
      [eligible.gig_id, eligible.application_id, input.posterId, eligible.worker_id]
    )

    await client.query('commit')

    return mapHire(hireResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

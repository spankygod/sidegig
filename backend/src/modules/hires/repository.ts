import type { Pool } from 'pg'
import type { HireStatus, HireSummary } from './types'

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

type HireTransitionInput = {
  actorId: string
  actorRole: 'poster' | 'worker'
  allowedStatuses: HireStatus[]
  gigStatus?: 'funded' | 'in_progress' | 'completed' | 'disputed'
  hireId: string
  nextStatus: HireStatus
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

async function updateHireStatus (
  db: Pool,
  input: HireTransitionInput
): Promise<HireSummary | null> {
  const client = await db.connect()
  const actorColumn = input.actorRole === 'poster' ? 'poster_id' : 'worker_id'

  try {
    await client.query('begin')

    const currentResult = await client.query<HireRow>(
      `
        select
          id,
          gig_id,
          application_id,
          poster_id,
          worker_id,
          status,
          funded_at,
          created_at,
          updated_at
        from public.hires
        where id = $1
          and ${actorColumn} = $2
          and status = any($3::public.hire_status[])
        for update
      `,
      [input.hireId, input.actorId, input.allowedStatuses]
    )

    if (currentResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const current = currentResult.rows[0]

    if (input.gigStatus != null) {
      await client.query(
        `
          update public.gig_posts
          set status = $2
          where id = $1
        `,
        [current.gig_id, input.gigStatus]
      )
    }

    const updatedResult = await client.query<HireRow>(
      `
        update public.hires
        set status = $2
        where id = $1
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
      [input.hireId, input.nextStatus]
    )

    await client.query('commit')

    return mapHire(updatedResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
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

export async function listUserHires (
  db: Pool,
  userId: string,
  filters?: {
    status?: HireStatus
  }
): Promise<HireSummary[]> {
  const values: Array<string | HireStatus> = [userId]
  const conditions = ['(poster_id = $1 or worker_id = $1)']

  if (filters?.status != null) {
    values.push(filters.status)
    conditions.push(`status = $${values.length}`)
  }

  const result = await db.query<HireRow>(
    `
      select
        id,
        gig_id,
        application_id,
        poster_id,
        worker_id,
        status,
        funded_at,
        created_at,
        updated_at
      from public.hires
      where ${conditions.join(' and ')}
      order by updated_at desc, created_at desc
    `,
    values
  )

  return result.rows.map(mapHire)
}

export async function getUserHireById (
  db: Pool,
  input: {
    hireId: string
    userId: string
  }
): Promise<HireSummary | null> {
  const result = await db.query<HireRow>(
    `
      select
        id,
        gig_id,
        application_id,
        poster_id,
        worker_id,
        status,
        funded_at,
        created_at,
        updated_at
      from public.hires
      where id = $1
        and (poster_id = $2 or worker_id = $2)
    `,
    [input.hireId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapHire(result.rows[0])
}

export async function acceptFundedHire (
  db: Pool,
  input: {
    hireId: string
    workerId: string
  }
): Promise<HireSummary | null> {
  return await updateHireStatus(db, {
    actorId: input.workerId,
    actorRole: 'worker',
    allowedStatuses: ['funded'],
    hireId: input.hireId,
    nextStatus: 'accepted'
  })
}

export async function startAcceptedHire (
  db: Pool,
  input: {
    hireId: string
    workerId: string
  }
): Promise<HireSummary | null> {
  return await updateHireStatus(db, {
    actorId: input.workerId,
    actorRole: 'worker',
    allowedStatuses: ['accepted'],
    gigStatus: 'in_progress',
    hireId: input.hireId,
    nextStatus: 'in_progress'
  })
}

export async function markHireDone (
  db: Pool,
  input: {
    hireId: string
    workerId: string
  }
): Promise<HireSummary | null> {
  return await updateHireStatus(db, {
    actorId: input.workerId,
    actorRole: 'worker',
    allowedStatuses: ['in_progress'],
    hireId: input.hireId,
    nextStatus: 'worker_marked_done'
  })
}

export async function acceptHireCompletion (
  db: Pool,
  input: {
    hireId: string
    posterId: string
  }
): Promise<HireSummary | null> {
  return await updateHireStatus(db, {
    actorId: input.posterId,
    actorRole: 'poster',
    allowedStatuses: ['worker_marked_done'],
    gigStatus: 'completed',
    hireId: input.hireId,
    nextStatus: 'poster_accepted'
  })
}

export async function disputeHireCompletion (
  db: Pool,
  input: {
    hireId: string
    posterId: string
  }
): Promise<HireSummary | null> {
  return await updateHireStatus(db, {
    actorId: input.posterId,
    actorRole: 'poster',
    allowedStatuses: ['worker_marked_done'],
    gigStatus: 'disputed',
    hireId: input.hireId,
    nextStatus: 'disputed'
  })
}

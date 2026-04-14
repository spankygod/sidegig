import type { Pool } from 'pg'
import type { HireSummary } from '../hires/types'
import type { DisputeStatus, DisputeSummary, OpenHireDisputeResult } from './types'

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

type DisputeRow = {
  id: string
  hire_id: string
  opened_by: string
  poster_id: string
  worker_id: string
  reason: string
  details: string | null
  status: DisputeStatus
  resolution: string | null
  resolved_at: Date | string | null
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

function mapDispute (row: DisputeRow): DisputeSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    openedBy: row.opened_by,
    posterId: row.poster_id,
    workerId: row.worker_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    resolution: row.resolution,
    resolvedAt: row.resolved_at == null ? null : toIsoString(row.resolved_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

export async function listUserDisputes (
  db: Pool,
  userId: string,
  filters?: {
    status?: DisputeStatus
  }
): Promise<DisputeSummary[]> {
  const values: Array<string | DisputeStatus> = [userId]
  const conditions = ['(poster_id = $1 or worker_id = $1)']

  if (filters?.status != null) {
    values.push(filters.status)
    conditions.push(`status = $${values.length}`)
  }

  const result = await db.query<DisputeRow>(
    `
      select
        id,
        hire_id,
        opened_by,
        poster_id,
        worker_id,
        reason,
        details,
        status,
        resolution,
        resolved_at,
        created_at,
        updated_at
      from public.disputes
      where ${conditions.join(' and ')}
      order by updated_at desc, created_at desc
    `,
    values
  )

  return result.rows.map(mapDispute)
}

export async function getUserDisputeById (
  db: Pool,
  input: {
    disputeId: string
    userId: string
  }
): Promise<DisputeSummary | null> {
  const result = await db.query<DisputeRow>(
    `
      select
        id,
        hire_id,
        opened_by,
        poster_id,
        worker_id,
        reason,
        details,
        status,
        resolution,
        resolved_at,
        created_at,
        updated_at
      from public.disputes
      where id = $1
        and (poster_id = $2 or worker_id = $2)
    `,
    [input.disputeId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapDispute(result.rows[0])
}

export async function openHireDispute (
  db: Pool,
  input: {
    hireId: string
    posterId: string
    reason: string
    details?: string | null
  }
): Promise<OpenHireDisputeResult | null> {
  const client = await db.connect()
  const reason = input.reason.trim()
  const details = input.details?.trim() === '' ? null : input.details?.trim() ?? null

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
          and poster_id = $2
          and status = 'worker_marked_done'
        for update
      `,
      [input.hireId, input.posterId]
    )

    if (currentResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const current = currentResult.rows[0]

    const existingResult = await client.query(
      `
        select id
        from public.disputes
        where hire_id = $1
        for update
      `,
      [current.id]
    )

    if (existingResult.rowCount !== 0) {
      await client.query('rollback')
      return null
    }

    await client.query(
      `
        update public.gig_posts
        set status = 'disputed'
        where id = $1
      `,
      [current.gig_id]
    )

    const hireResult = await client.query<HireRow>(
      `
        update public.hires
        set status = 'disputed'
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
      [current.id]
    )

    const disputeResult = await client.query<DisputeRow>(
      `
        insert into public.disputes (
          hire_id,
          opened_by,
          poster_id,
          worker_id,
          reason,
          details
        )
        values ($1, $2, $3, $4, $5, $6)
        returning
          id,
          hire_id,
          opened_by,
          poster_id,
          worker_id,
          reason,
          details,
          status,
          resolution,
          resolved_at,
          created_at,
          updated_at
      `,
      [current.id, input.posterId, current.poster_id, current.worker_id, reason, details]
    )

    await client.query('commit')

    return {
      hire: mapHire(hireResult.rows[0]),
      dispute: mapDispute(disputeResult.rows[0])
    }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

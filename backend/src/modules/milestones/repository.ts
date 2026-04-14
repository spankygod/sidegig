import type { Pool } from 'pg'
import type { HireMilestoneStatus, HireMilestoneSummary } from './types'

type HireMilestoneRow = {
  id: string
  hire_id: string
  created_by: string
  title: string
  description: string | null
  status: HireMilestoneStatus
  due_at: Date | string | null
  completed_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

type HireAccessRow = {
  poster_id: string
  worker_id: string
  status: string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapMilestone (row: HireMilestoneRow): HireMilestoneSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    status: row.status,
    dueAt: row.due_at == null ? null : toIsoString(row.due_at),
    completedAt: row.completed_at == null ? null : toIsoString(row.completed_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  }
}

export async function listHireMilestones (
  db: Pool,
  input: {
    hireId: string
    userId: string
  }
): Promise<HireMilestoneSummary[] | null> {
  const accessResult = await db.query(
    `
      select 1
      from public.hires
      where id = $1
        and (poster_id = $2 or worker_id = $2)
    `,
    [input.hireId, input.userId]
  )

  if (accessResult.rowCount === 0) {
    return null
  }

  const result = await db.query<HireMilestoneRow>(
    `
      select
        id,
        hire_id,
        created_by,
        title,
        description,
        status,
        due_at,
        completed_at,
        created_at,
        updated_at
      from public.hire_milestones
      where hire_id = $1
      order by created_at asc
    `,
    [input.hireId]
  )

  return result.rows.map(mapMilestone)
}

export async function createHireMilestone (
  db: Pool,
  input: {
    hireId: string
    posterId: string
    title: string
    description?: string | null
    dueAt?: string | null
  }
): Promise<{ milestone: HireMilestoneSummary, notifyUserId: string } | null> {
  const result = await db.query<HireMilestoneRow & { worker_id: string }>(
    `
      with hire_access as (
        select
          id,
          worker_id
        from public.hires
        where id = $1
          and poster_id = $2
          and status in ('funded', 'accepted', 'in_progress', 'worker_marked_done')
      ),
      inserted as (
        insert into public.hire_milestones (
          hire_id,
          created_by,
          title,
          description,
          due_at
        )
        select
          id,
          $2,
          $3,
          $4,
          $5
        from hire_access
        returning
          id,
          hire_id,
          created_by,
          title,
          description,
          status,
          due_at,
          completed_at,
          created_at,
          updated_at
      )
      select
        inserted.*,
        hire_access.worker_id
      from inserted
      inner join hire_access on hire_access.id = inserted.hire_id
    `,
    [
      input.hireId,
      input.posterId,
      input.title.trim(),
      input.description?.trim() === '' ? null : input.description?.trim() ?? null,
      input.dueAt ?? null
    ]
  )

  if (result.rowCount === 0) {
    return null
  }

  return {
    milestone: mapMilestone(result.rows[0]),
    notifyUserId: result.rows[0].worker_id
  }
}

export async function updateHireMilestoneStatus (
  db: Pool,
  input: {
    hireId: string
    milestoneId: string
    userId: string
    status: HireMilestoneStatus
  }
): Promise<{ milestone: HireMilestoneSummary, notifyUserId: string } | null> {
  const client = await db.connect()

  try {
    await client.query('begin')

    const accessResult = await client.query<HireAccessRow>(
      `
        select
          poster_id,
          worker_id,
          status
        from public.hires
        where id = $1
          and (poster_id = $2 or worker_id = $2)
          and status in ('funded', 'accepted', 'in_progress', 'worker_marked_done')
        for update
      `,
      [input.hireId, input.userId]
    )

    if (accessResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const hire = accessResult.rows[0]
    const isPoster = hire.poster_id === input.userId

    if (input.status === 'cancelled' && !isPoster) {
      await client.query('rollback')
      return null
    }

    const result = await client.query<HireMilestoneRow>(
      `
        update public.hire_milestones
        set
          status = $3::public.hire_milestone_status,
          completed_at = case when $3 = 'completed' then now() else null end
        where id = $1
          and hire_id = $2
          and status <> 'cancelled'
        returning
          id,
          hire_id,
          created_by,
          title,
          description,
          status,
          due_at,
          completed_at,
          created_at,
          updated_at
      `,
      [input.milestoneId, input.hireId, input.status]
    )

    if (result.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    await client.query('commit')

    return {
      milestone: mapMilestone(result.rows[0]),
      notifyUserId: isPoster ? hire.worker_id : hire.poster_id
    }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

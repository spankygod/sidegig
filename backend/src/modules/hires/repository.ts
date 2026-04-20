import type { Pool } from 'pg'
import type { HireStatus, HireSummary, HireWorkDetail } from './types'

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

type HireWorkDetailRow = HireRow & {
  gig_title: string
  gig_category: string
  gig_description: string
  gig_price_amount: number
  gig_currency: 'PHP'
  gig_duration_bucket: string
  gig_status: string
  gig_application_radius_km: number
  gig_schedule_summary: string
  gig_city: string
  gig_barangay: string
  gig_latitude: string | number
  gig_longitude: string | number
  gig_starts_at: Date | string | null
  gig_ends_at: Date | string | null
  gig_created_at: Date | string
  gig_updated_at: Date | string
  application_status: string
  application_intro: string
  application_availability: string
  application_created_at: Date | string
  application_updated_at: Date | string
  poster_display_name: string
  poster_city: string | null
  poster_barangay: string | null
  poster_rating: string | number | null
  poster_review_count: number | null
  poster_jobs_completed: number | null
  poster_response_rate: number | null
  poster_gigs_posted: number | null
  poster_hires_funded: number | null
  poster_hires_completed: number | null
  worker_display_name: string
  worker_city: string | null
  worker_barangay: string | null
  worker_rating: string | number | null
  worker_review_count: number | null
  worker_jobs_completed: number | null
  worker_response_rate: number | null
  worker_gigs_posted: number | null
  worker_hires_funded: number | null
  worker_hires_completed: number | null
}

type HireTransitionInput = {
  actorId: string
  actorRole: 'poster' | 'worker'
  allowedStatuses: HireStatus[]
  gigStatus?: 'funded' | 'in_progress' | 'completed' | 'disputed'
  hireId: string
  incrementWorkerJobsCompleted?: boolean
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

function mapHireWorkDetail (row: HireWorkDetailRow, userId: string): HireWorkDetail {
  return {
    viewerRole: row.poster_id === userId ? 'poster' : 'worker',
    hire: mapHire(row),
    gig: {
      id: row.gig_id,
      title: row.gig_title,
      category: row.gig_category,
      description: row.gig_description,
      priceAmount: row.gig_price_amount,
      currency: row.gig_currency,
      durationBucket: row.gig_duration_bucket,
      status: row.gig_status,
      applicationRadiusKm: row.gig_application_radius_km,
      scheduleSummary: row.gig_schedule_summary,
      startsAt: row.gig_starts_at == null ? null : toIsoString(row.gig_starts_at),
      endsAt: row.gig_ends_at == null ? null : toIsoString(row.gig_ends_at),
      location: {
        city: row.gig_city,
        barangay: row.gig_barangay,
        latitude: Number(row.gig_latitude),
        longitude: Number(row.gig_longitude),
        exactPinVisible: true
      },
      createdAt: toIsoString(row.gig_created_at),
      updatedAt: toIsoString(row.gig_updated_at)
    },
    application: {
      id: row.application_id,
      status: row.application_status,
      intro: row.application_intro,
      availability: row.application_availability,
      createdAt: toIsoString(row.application_created_at),
      updatedAt: toIsoString(row.application_updated_at)
    },
    poster: {
      id: row.poster_id,
      displayName: row.poster_display_name,
      city: row.poster_city,
      barangay: row.poster_barangay,
      stats: {
        rating: Number(row.poster_rating ?? 0),
        reviewCount: row.poster_review_count ?? 0,
        jobsCompleted: row.poster_jobs_completed ?? 0,
        responseRate: row.poster_response_rate ?? 0,
        gigsPosted: row.poster_gigs_posted ?? 0,
        hiresFunded: row.poster_hires_funded ?? 0,
        hiresCompleted: row.poster_hires_completed ?? 0
      }
    },
    worker: {
      id: row.worker_id,
      displayName: row.worker_display_name,
      city: row.worker_city,
      barangay: row.worker_barangay,
      stats: {
        rating: Number(row.worker_rating ?? 0),
        reviewCount: row.worker_review_count ?? 0,
        jobsCompleted: row.worker_jobs_completed ?? 0,
        responseRate: row.worker_response_rate ?? 0,
        gigsPosted: row.worker_gigs_posted ?? 0,
        hiresFunded: row.worker_hires_funded ?? 0,
        hiresCompleted: row.worker_hires_completed ?? 0
      }
    }
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

    if (input.incrementWorkerJobsCompleted === true) {
      await client.query(
        `
          insert into public.user_stats (user_id)
          values ($1)
          on conflict (user_id) do nothing
        `,
        [current.worker_id]
      )

      await client.query(
        `
          insert into public.user_stats (user_id)
          values ($1)
          on conflict (user_id) do nothing
        `,
        [current.poster_id]
      )

      await client.query(
        `
          update public.user_stats
          set jobs_completed = jobs_completed + 1
          where user_id = $1
        `,
        [current.worker_id]
      )

      await client.query(
        `
          update public.user_stats
          set hires_completed = hires_completed + 1
          where user_id = $1
        `,
        [current.poster_id]
      )
    }

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
        insert into public.user_stats (user_id)
        values ($1)
        on conflict (user_id) do nothing
      `,
      [input.posterId]
    )

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

    await client.query(
      `
        update public.user_stats
        set hires_funded = hires_funded + 1
        where user_id = $1
      `,
      [input.posterId]
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

export async function getHireWorkDetail (
  db: Pool,
  input: {
    hireId: string
    userId: string
  }
): Promise<HireWorkDetail | null> {
  const result = await db.query<HireWorkDetailRow>(
    `
      select
        h.id,
        h.gig_id,
        h.application_id,
        h.poster_id,
        h.worker_id,
        h.status,
        h.funded_at,
        h.created_at,
        h.updated_at,
        g.title as gig_title,
        g.category as gig_category,
        g.description as gig_description,
        g.price_amount as gig_price_amount,
        g.currency as gig_currency,
        g.duration_bucket as gig_duration_bucket,
        g.status as gig_status,
        g.application_radius_km as gig_application_radius_km,
        g.schedule_summary as gig_schedule_summary,
        g.city as gig_city,
        g.barangay as gig_barangay,
        g.latitude as gig_latitude,
        g.longitude as gig_longitude,
        g.starts_at as gig_starts_at,
        g.ends_at as gig_ends_at,
        g.created_at as gig_created_at,
        g.updated_at as gig_updated_at,
        ga.status as application_status,
        ga.intro as application_intro,
        ga.availability as application_availability,
        ga.created_at as application_created_at,
        ga.updated_at as application_updated_at,
        poster.display_name as poster_display_name,
        poster.city as poster_city,
        poster.barangay as poster_barangay,
        poster_stats.rating as poster_rating,
        poster_stats.review_count as poster_review_count,
        poster_stats.jobs_completed as poster_jobs_completed,
        poster_stats.response_rate as poster_response_rate,
        poster_stats.gigs_posted as poster_gigs_posted,
        poster_stats.hires_funded as poster_hires_funded,
        poster_stats.hires_completed as poster_hires_completed,
        worker.display_name as worker_display_name,
        worker.city as worker_city,
        worker.barangay as worker_barangay,
        worker_stats.rating as worker_rating,
        worker_stats.review_count as worker_review_count,
        worker_stats.jobs_completed as worker_jobs_completed,
        worker_stats.response_rate as worker_response_rate,
        worker_stats.gigs_posted as worker_gigs_posted,
        worker_stats.hires_funded as worker_hires_funded,
        worker_stats.hires_completed as worker_hires_completed
      from public.hires h
      inner join public.gig_posts g on g.id = h.gig_id
      inner join public.gig_applications ga on ga.id = h.application_id
      inner join public.profiles poster on poster.id = h.poster_id
      inner join public.profiles worker on worker.id = h.worker_id
      left join public.user_stats poster_stats on poster_stats.user_id = h.poster_id
      left join public.user_stats worker_stats on worker_stats.user_id = h.worker_id
      where h.id = $1
        and (h.poster_id = $2 or h.worker_id = $2)
    `,
    [input.hireId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapHireWorkDetail(result.rows[0], input.userId)
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
    incrementWorkerJobsCompleted: true,
    nextStatus: 'payout_ready'
  })
}

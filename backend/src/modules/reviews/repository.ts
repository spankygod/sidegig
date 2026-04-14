import type { Pool, PoolClient } from 'pg'
import type { ReviewSummary } from './types'

type ReviewRow = {
  id: string
  hire_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: Date | string
  updated_at: Date | string
  reviewer_display_name: string
  reviewer_city: string | null
  reviewer_barangay: string | null
}

type HireReviewEligibilityRow = {
  id: string
  poster_id: string
  worker_id: string
  status: string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapReview (row: ReviewRow): ReviewSummary {
  return {
    id: row.id,
    hireId: row.hire_id,
    reviewerId: row.reviewer_id,
    revieweeId: row.reviewee_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    reviewer: {
      id: row.reviewer_id,
      displayName: row.reviewer_display_name,
      city: row.reviewer_city,
      barangay: row.reviewer_barangay
    }
  }
}

async function refreshReviewStats (db: Pool | PoolClient, userId: string): Promise<void> {
  await db.query(
    `
      insert into public.user_stats (user_id)
      values ($1)
      on conflict (user_id) do nothing
    `,
    [userId]
  )

  await db.query(
    `
      update public.user_stats
      set
        rating = coalesce((
          select round(avg(rating)::numeric, 2)
          from public.reviews
          where reviewee_id = $1
        ), 0),
        review_count = (
          select count(*)::int
          from public.reviews
          where reviewee_id = $1
        ),
        updated_at = now()
      where user_id = $1
    `,
    [userId]
  )
}

export async function listUserReceivedReviews (
  db: Pool,
  input: {
    userId: string
    limit?: number
  }
): Promise<ReviewSummary[]> {
  const result = await db.query<ReviewRow>(
    `
      select
        r.id,
        r.hire_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        reviewer.display_name as reviewer_display_name,
        reviewer.city as reviewer_city,
        reviewer.barangay as reviewer_barangay
      from public.reviews r
      inner join public.profiles reviewer on reviewer.id = r.reviewer_id
      where r.reviewee_id = $1
      order by r.created_at desc
      limit $2
    `,
    [input.userId, input.limit ?? 50]
  )

  return result.rows.map(mapReview)
}

export async function createHireReview (
  db: Pool,
  input: {
    hireId: string
    reviewerId: string
    rating: number
    comment?: string | null
  }
): Promise<ReviewSummary | null> {
  const client = await db.connect()
  const comment = input.comment?.trim() === '' ? null : input.comment?.trim() ?? null

  try {
    await client.query('begin')

    const hireResult = await client.query<HireReviewEligibilityRow>(
      `
        select
          id,
          poster_id,
          worker_id,
          status
        from public.hires
        where id = $1
          and status in ('poster_accepted', 'payout_ready', 'paid_out')
          and (poster_id = $2 or worker_id = $2)
        for update
      `,
      [input.hireId, input.reviewerId]
    )

    if (hireResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    const hire = hireResult.rows[0]
    const revieweeId = hire.poster_id === input.reviewerId ? hire.worker_id : hire.poster_id

    const reviewResult = await client.query<ReviewRow>(
      `
        insert into public.reviews (
          hire_id,
          reviewer_id,
          reviewee_id,
          rating,
          comment
        )
        values ($1, $2, $3, $4, $5)
        on conflict (hire_id, reviewer_id) do nothing
        returning
          id,
          hire_id,
          reviewer_id,
          reviewee_id,
          rating,
          comment,
          created_at,
          updated_at,
          (
            select display_name
            from public.profiles
            where id = reviewer_id
          ) as reviewer_display_name,
          (
            select city
            from public.profiles
            where id = reviewer_id
          ) as reviewer_city,
          (
            select barangay
            from public.profiles
            where id = reviewer_id
          ) as reviewer_barangay
      `,
      [input.hireId, input.reviewerId, revieweeId, input.rating, comment]
    )

    if (reviewResult.rowCount === 0) {
      await client.query('rollback')
      return null
    }

    await refreshReviewStats(client, revieweeId)
    await client.query('commit')

    return mapReview(reviewResult.rows[0])
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

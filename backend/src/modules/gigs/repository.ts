import type { Pool } from 'pg'
import type { CreateGigInput, CreatedGig, GigListFilters, PublicGig } from './types'

type GigRow = {
  id: string
  title: string
  category: PublicGig['category']
  description: string
  price_amount: number
  currency: 'PHP'
  duration_bucket: PublicGig['durationBucket']
  status: string
  schedule_summary: string
  city: string
  barangay: string
  latitude: string | number
  longitude: string | number
  supervisor_present: boolean
  ppe_provided: boolean
  helper_only_confirmation: boolean
  physical_load: string | null
  created_at: Date | string
  poster_id: string
  poster_display_name: string
  poster_rating: string | number | null
  poster_review_count: number | null
  poster_jobs_completed: number | null
  poster_response_rate: number | null
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapPublicGig (row: GigRow): PublicGig {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    priceAmount: row.price_amount,
    currency: row.currency,
    durationBucket: row.duration_bucket,
    status: row.status,
    scheduleSummary: row.schedule_summary,
    location: {
      city: row.city,
      barangay: row.barangay,
      exactPinVisible: false
    },
    construction: row.category === 'construction_helper'
      ? {
          supervisorPresent: row.supervisor_present,
          ppeProvided: row.ppe_provided,
          helperOnlyConfirmation: row.helper_only_confirmation,
          physicalLoad: row.physical_load
        }
      : null,
    poster: {
      id: row.poster_id,
      displayName: row.poster_display_name,
      rating: Number(row.poster_rating ?? 0),
      reviewCount: row.poster_review_count ?? 0,
      jobsCompleted: row.poster_jobs_completed ?? 0,
      responseRate: row.poster_response_rate ?? 0
    },
    createdAt: toIsoString(row.created_at)
  }
}

function mapCreatedGig (row: GigRow): CreatedGig {
  const publicGig = mapPublicGig(row)

  return {
    ...publicGig,
    location: {
      city: row.city,
      barangay: row.barangay,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      exactPinVisible: true
    }
  }
}

export async function listPublicGigs (db: Pool, filters: GigListFilters): Promise<PublicGig[]> {
  const values: Array<string | number> = []
  const conditions: string[] = [
    `g.status in ('published', 'shortlisting')`
  ]

  if (filters.category != null) {
    values.push(filters.category)
    conditions.push(`g.category = $${values.length}`)
  }

  if (filters.city != null && filters.city.trim() !== '') {
    values.push(filters.city.trim())
    conditions.push(`g.city = $${values.length}`)
  }

  values.push(filters.limit)

  const query = `
    select
      g.id,
      g.title,
      g.category,
      g.description,
      g.price_amount,
      g.currency,
      g.duration_bucket,
      g.status,
      g.schedule_summary,
      g.city,
      g.barangay,
      g.latitude,
      g.longitude,
      g.supervisor_present,
      g.ppe_provided,
      g.helper_only_confirmation,
      g.physical_load,
      g.created_at,
      p.id as poster_id,
      p.display_name as poster_display_name,
      us.rating as poster_rating,
      us.review_count as poster_review_count,
      us.jobs_completed as poster_jobs_completed,
      us.response_rate as poster_response_rate
    from public.gig_posts g
    inner join public.profiles p on p.id = g.poster_id
    left join public.user_stats us on us.user_id = p.id
    where ${conditions.join(' and ')}
    order by g.created_at desc
    limit $${values.length}
  `

  const result = await db.query<GigRow>(query, values)

  return result.rows.map(mapPublicGig)
}

export async function createGig (
  db: Pool,
  posterId: string,
  input: CreateGigInput
): Promise<CreatedGig> {
  const result = await db.query<GigRow>(
    `
      with inserted as (
        insert into public.gig_posts (
          poster_id,
          title,
          category,
          description,
          price_amount,
          duration_bucket,
          city,
          barangay,
          latitude,
          longitude,
          schedule_summary,
          supervisor_present,
          ppe_provided,
          helper_only_confirmation,
          physical_load,
          starts_at,
          ends_at
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17
        )
        returning *
      )
      select
        inserted.id,
        inserted.title,
        inserted.category,
        inserted.description,
        inserted.price_amount,
        inserted.currency,
        inserted.duration_bucket,
        inserted.status,
        inserted.schedule_summary,
        inserted.city,
        inserted.barangay,
        inserted.latitude,
        inserted.longitude,
        inserted.supervisor_present,
        inserted.ppe_provided,
        inserted.helper_only_confirmation,
        inserted.physical_load,
        inserted.created_at,
        p.id as poster_id,
        p.display_name as poster_display_name,
        us.rating as poster_rating,
        us.review_count as poster_review_count,
        us.jobs_completed as poster_jobs_completed,
        us.response_rate as poster_response_rate
      from inserted
      inner join public.profiles p on p.id = inserted.poster_id
      left join public.user_stats us on us.user_id = p.id
    `,
    [
      posterId,
      input.title,
      input.category,
      input.description,
      input.priceAmount,
      input.durationBucket,
      input.city,
      input.barangay,
      input.latitude,
      input.longitude,
      input.scheduleSummary,
      input.supervisorPresent ?? false,
      input.ppeProvided ?? false,
      input.helperOnlyConfirmation ?? false,
      input.physicalLoad ?? null,
      input.startsAt ?? null,
      input.endsAt ?? null
    ]
  )

  return mapCreatedGig(result.rows[0])
}

export async function getGigOwnership (
  db: Pool,
  gigId: string
): Promise<{ id: string; posterId: string; status: string; title: string } | null> {
  const result = await db.query<{
    id: string
    poster_id: string
    status: string
    title: string
  }>(
    `
      select id, poster_id, status, title
      from public.gig_posts
      where id = $1
    `,
    [gigId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return {
    id: result.rows[0].id,
    posterId: result.rows[0].poster_id,
    status: result.rows[0].status,
    title: result.rows[0].title
  }
}

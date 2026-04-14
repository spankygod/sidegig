import type { Pool } from 'pg'
import {
  DEFAULT_GIG_APPLICATION_RADIUS_KM,
  DEFAULT_SERVICE_RADIUS_KM,
  type CreateGigInput,
  type CreatedGig,
  type GigListFilters,
  type GigStatus,
  type OwnedGig,
  type PublicGig,
  type UpdateGigInput
} from './types'

type GigRow = {
  id: string
  title: string
  category: PublicGig['category']
  description: string
  price_amount: number
  currency: 'PHP'
  duration_bucket: PublicGig['durationBucket']
  status: GigStatus
  schedule_summary: string
  city: string
  barangay: string
  latitude: string | number
  longitude: string | number
  application_radius_km: number
  supervisor_present: boolean
  ppe_provided: boolean
  helper_only_confirmation: boolean
  physical_load: string | null
  starts_at: Date | string | null
  ends_at: Date | string | null
  created_at: Date | string
  distance_km: string | number | null
  poster_id: string
  poster_display_name: string
  poster_rating: string | number | null
  poster_review_count: number | null
  poster_jobs_completed: number | null
  poster_response_rate: number | null
}

type OwnedGigRow = {
  id: string
  title: string
  category: OwnedGig['category']
  description: string
  price_amount: number
  currency: 'PHP'
  duration_bucket: OwnedGig['durationBucket']
  status: OwnedGig['status']
  schedule_summary: string
  city: string
  barangay: string
  latitude: string | number
  longitude: string | number
  application_radius_km: number
  supervisor_present: boolean
  ppe_provided: boolean
  helper_only_confirmation: boolean
  physical_load: string | null
  starts_at: Date | string | null
  ends_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
  application_count: number
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
    applicationRadiusKm: row.application_radius_km,
    distanceKm: row.distance_km == null ? null : Number(row.distance_km),
    scheduleSummary: row.schedule_summary,
    startsAt: row.starts_at == null ? null : toIsoString(row.starts_at),
    endsAt: row.ends_at == null ? null : toIsoString(row.ends_at),
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

function mapOwnedGig (row: OwnedGigRow): OwnedGig {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    priceAmount: row.price_amount,
    currency: row.currency,
    durationBucket: row.duration_bucket,
    status: row.status,
    applicationRadiusKm: row.application_radius_km,
    distanceKm: null,
    scheduleSummary: row.schedule_summary,
    startsAt: row.starts_at == null ? null : toIsoString(row.starts_at),
    endsAt: row.ends_at == null ? null : toIsoString(row.ends_at),
    location: {
      city: row.city,
      barangay: row.barangay,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      exactPinVisible: true
    },
    construction: row.category === 'construction_helper'
      ? {
          supervisorPresent: row.supervisor_present,
          ppeProvided: row.ppe_provided,
          helperOnlyConfirmation: row.helper_only_confirmation,
          physicalLoad: row.physical_load
        }
      : null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    applicationCount: row.application_count
  }
}

function ownedGigSelect (): string {
  return `
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
      g.application_radius_km,
      g.supervisor_present,
      g.ppe_provided,
      g.helper_only_confirmation,
      g.physical_load,
      g.starts_at,
      g.ends_at,
      g.created_at,
      g.updated_at,
      coalesce(app_counts.application_count, 0) as application_count
    from public.gig_posts g
    left join lateral (
      select
        count(ga.id)::int as application_count
      from public.gig_applications ga
      where ga.gig_id = g.id
    ) app_counts on true
  `
}

export async function listPublicGigs (db: Pool, filters: GigListFilters): Promise<PublicGig[]> {
  const values: Array<string | number> = []
  const conditions: string[] = [
    `g.status = 'published'`
  ]
  let distanceExpression = 'null::numeric'
  let orderBy = 'g.created_at desc'

  if (filters.category != null) {
    values.push(filters.category)
    conditions.push(`g.category = $${values.length}`)
  }

  if (filters.city != null && filters.city.trim() !== '') {
    values.push(filters.city.trim())
    conditions.push(`g.city = $${values.length}`)
  }

  if (filters.latitude != null && filters.longitude != null) {
    values.push(filters.latitude)
    const latitudeParam = values.length
    values.push(filters.longitude)
    const longitudeParam = values.length
    values.push(filters.radiusKm ?? DEFAULT_SERVICE_RADIUS_KM)
    const radiusParam = values.length

    distanceExpression = `public.calculate_distance_km($${latitudeParam}, $${longitudeParam}, g.latitude, g.longitude)`
    conditions.push(`${distanceExpression} <= least($${radiusParam}::numeric, g.application_radius_km::numeric)`)
    orderBy = 'distance_km asc, g.created_at desc'
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
      g.application_radius_km,
      g.supervisor_present,
      g.ppe_provided,
      g.helper_only_confirmation,
      g.physical_load,
      g.starts_at,
      g.ends_at,
      g.created_at,
      round((${distanceExpression})::numeric, 2) as distance_km,
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
    order by ${orderBy}
    limit $${values.length}
  `

  const result = await db.query<GigRow>(query, values)

  return result.rows.map(mapPublicGig)
}

export async function getPublicGigById (
  db: Pool,
  gigId: string,
  filters?: {
    latitude?: number
    longitude?: number
  }
): Promise<PublicGig | null> {
  const values: Array<string | number> = [gigId]
  let distanceExpression = 'null::numeric'

  if (filters?.latitude != null && filters.longitude != null) {
    values.push(filters.latitude)
    const latitudeParam = values.length
    values.push(filters.longitude)
    const longitudeParam = values.length

    distanceExpression = `public.calculate_distance_km($${latitudeParam}, $${longitudeParam}, g.latitude, g.longitude)`
  }

  const result = await db.query<GigRow>(
    `
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
        g.application_radius_km,
        g.supervisor_present,
        g.ppe_provided,
        g.helper_only_confirmation,
        g.physical_load,
        g.starts_at,
        g.ends_at,
        g.created_at,
        round((${distanceExpression})::numeric, 2) as distance_km,
        p.id as poster_id,
        p.display_name as poster_display_name,
        us.rating as poster_rating,
        us.review_count as poster_review_count,
        us.jobs_completed as poster_jobs_completed,
        us.response_rate as poster_response_rate
      from public.gig_posts g
      inner join public.profiles p on p.id = g.poster_id
      left join public.user_stats us on us.user_id = p.id
      where g.id = $1
        and g.status = 'published'
    `,
    values
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapPublicGig(result.rows[0])
}

export async function listPosterGigs (
  db: Pool,
  posterId: string,
  filters: { status?: GigStatus, limit: number }
): Promise<OwnedGig[]> {
  const values: Array<string | number> = [posterId]
  const conditions = ['g.poster_id = $1']

  if (filters.status != null) {
    values.push(filters.status)
    conditions.push(`g.status = $${values.length}`)
  }

  values.push(filters.limit)

  const result = await db.query<OwnedGigRow>(
    `
      ${ownedGigSelect()}
      where ${conditions.join(' and ')}
      order by g.updated_at desc, g.created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapOwnedGig)
}

export async function getPosterGigById (
  db: Pool,
  posterId: string,
  gigId: string
): Promise<OwnedGig | null> {
  const result = await db.query<OwnedGigRow>(
    `
      ${ownedGigSelect()}
      where g.poster_id = $1
        and g.id = $2
    `,
    [posterId, gigId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapOwnedGig(result.rows[0])
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
          application_radius_km,
          schedule_summary,
          supervisor_present,
          ppe_provided,
          helper_only_confirmation,
          physical_load,
          starts_at,
          ends_at,
          status
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
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
        inserted.application_radius_km,
        inserted.supervisor_present,
        inserted.ppe_provided,
        inserted.helper_only_confirmation,
        inserted.physical_load,
        inserted.starts_at,
        inserted.ends_at,
        inserted.created_at,
        null::numeric as distance_km,
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
      input.applicationRadiusKm ?? DEFAULT_GIG_APPLICATION_RADIUS_KM,
      input.scheduleSummary,
      input.supervisorPresent ?? false,
      input.ppeProvided ?? false,
      input.helperOnlyConfirmation ?? false,
      input.physicalLoad ?? null,
      input.startsAt ?? null,
      input.endsAt ?? null,
      input.status ?? 'published'
    ]
  )

  return mapCreatedGig(result.rows[0])
}

export async function updatePosterGig (
  db: Pool,
  posterId: string,
  gigId: string,
  input: UpdateGigInput
): Promise<OwnedGig | null> {
  const result = await db.query<OwnedGigRow>(
    `
      with updated as (
        update public.gig_posts
        set
          title = coalesce($3, title),
          category = coalesce($4, category),
          description = coalesce($5, description),
          price_amount = coalesce($6, price_amount),
          duration_bucket = coalesce($7, duration_bucket),
          city = coalesce($8, city),
          barangay = coalesce($9, barangay),
          latitude = case when $10::boolean then $11 else latitude end,
          longitude = case when $12::boolean then $13 else longitude end,
          application_radius_km = coalesce($14, application_radius_km),
          schedule_summary = coalesce($15, schedule_summary),
          supervisor_present = case when $16::boolean then $17 else supervisor_present end,
          ppe_provided = case when $18::boolean then $19 else ppe_provided end,
          helper_only_confirmation = case when $20::boolean then $21 else helper_only_confirmation end,
          physical_load = case when $22::boolean then $23 else physical_load end,
          starts_at = case when $24::boolean then $25 else starts_at end,
          ends_at = case when $26::boolean then $27 else ends_at end,
          status = coalesce($28, status)
        where id = $1
          and poster_id = $2
        returning *
      )
      select
        updated.id,
        updated.title,
        updated.category,
        updated.description,
        updated.price_amount,
        updated.currency,
        updated.duration_bucket,
        updated.status,
        updated.schedule_summary,
        updated.city,
        updated.barangay,
        updated.latitude,
        updated.longitude,
        updated.application_radius_km,
        updated.supervisor_present,
        updated.ppe_provided,
        updated.helper_only_confirmation,
        updated.physical_load,
        updated.starts_at,
        updated.ends_at,
        updated.created_at,
        updated.updated_at,
        coalesce(app_counts.application_count, 0) as application_count
      from updated
      left join lateral (
        select
          count(ga.id)::int as application_count
        from public.gig_applications ga
        where ga.gig_id = updated.id
      ) app_counts on true
    `,
    [
      gigId,
      posterId,
      input.title,
      input.category,
      input.description,
      input.priceAmount,
      input.durationBucket,
      input.city,
      input.barangay,
      Object.prototype.hasOwnProperty.call(input, 'latitude'),
      input.latitude ?? null,
      Object.prototype.hasOwnProperty.call(input, 'longitude'),
      input.longitude ?? null,
      input.applicationRadiusKm,
      input.scheduleSummary,
      Object.prototype.hasOwnProperty.call(input, 'supervisorPresent'),
      input.supervisorPresent ?? false,
      Object.prototype.hasOwnProperty.call(input, 'ppeProvided'),
      input.ppeProvided ?? false,
      Object.prototype.hasOwnProperty.call(input, 'helperOnlyConfirmation'),
      input.helperOnlyConfirmation ?? false,
      Object.prototype.hasOwnProperty.call(input, 'physicalLoad'),
      input.physicalLoad ?? null,
      Object.prototype.hasOwnProperty.call(input, 'startsAt'),
      input.startsAt ?? null,
      Object.prototype.hasOwnProperty.call(input, 'endsAt'),
      input.endsAt ?? null,
      input.status
    ]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapOwnedGig(result.rows[0])
}

export async function getGigOwnership (
  db: Pool,
  gigId: string
): Promise<{
    id: string
    posterId: string
    status: GigStatus
    title: string
    latitude: number
    longitude: number
    applicationRadiusKm: number
  } | null> {
  const result = await db.query<{
    id: string
    poster_id: string
    status: GigStatus
    title: string
    latitude: string | number
    longitude: string | number
    application_radius_km: number
  }>(
    `
      select id, poster_id, status, title, latitude, longitude, application_radius_km
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
    title: result.rows[0].title,
    latitude: Number(result.rows[0].latitude),
    longitude: Number(result.rows[0].longitude),
    applicationRadiusKm: result.rows[0].application_radius_km
  }
}

export async function getGigEligibilityForWorker (
  db: Pool,
  gigId: string,
  workerId: string
): Promise<{
    gigId: string
    posterId: string
    status: GigStatus
    title: string
    workerLatitude: number | null
    workerLongitude: number | null
    workerServiceRadiusKm: number | null
    gigLatitude: number
    gigLongitude: number
    gigApplicationRadiusKm: number
    distanceKm: number | null
  } | null> {
  const result = await db.query<{
    gig_id: string
    poster_id: string
    status: GigStatus
    title: string
    worker_latitude: string | number | null
    worker_longitude: string | number | null
    worker_service_radius_km: number | null
    gig_latitude: string | number
    gig_longitude: string | number
    gig_application_radius_km: number
    distance_km: string | number | null
  }>(
    `
      select
        gp.id as gig_id,
        gp.poster_id,
        gp.status,
        gp.title,
        p.latitude as worker_latitude,
        p.longitude as worker_longitude,
        p.service_radius_km as worker_service_radius_km,
        gp.latitude as gig_latitude,
        gp.longitude as gig_longitude,
        gp.application_radius_km as gig_application_radius_km,
        case
          when p.latitude is null or p.longitude is null then null
          else round(public.calculate_distance_km(
            p.latitude,
            p.longitude,
            gp.latitude,
            gp.longitude
          )::numeric, 2)
        end as distance_km
      from public.gig_posts gp
      left join public.profiles p on p.id = $2
      where gp.id = $1
    `,
    [gigId, workerId]
  )

  if (result.rowCount === 0) {
    return null
  }

  const row = result.rows[0]

  return {
    gigId: row.gig_id,
    posterId: row.poster_id,
    status: row.status,
    title: row.title,
    workerLatitude: row.worker_latitude == null ? null : Number(row.worker_latitude),
    workerLongitude: row.worker_longitude == null ? null : Number(row.worker_longitude),
    workerServiceRadiusKm: row.worker_service_radius_km,
    gigLatitude: Number(row.gig_latitude),
    gigLongitude: Number(row.gig_longitude),
    gigApplicationRadiusKm: row.gig_application_radius_km,
    distanceKm: row.distance_km == null ? null : Number(row.distance_km)
  }
}

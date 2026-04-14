import type { Pool } from 'pg'
import { deriveDisplayName, type AuthenticatedUser } from '../auth/types'
import { DEFAULT_SERVICE_RADIUS_KM } from '../proximity'
import type { UpdateUserProfileInput, UserProfile } from './types'

type UserProfileRow = {
  id: string
  display_name: string
  city: string | null
  barangay: string | null
  latitude: string | number | null
  longitude: string | number | null
  service_radius_km: number | null
  bio: string | null
  skills: string[] | null
  rating: string | number | null
  review_count: number | null
  jobs_completed: number | null
  response_rate: number | null
}

function mapUserProfile (row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    city: row.city,
    barangay: row.barangay,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    serviceRadiusKm: row.service_radius_km ?? DEFAULT_SERVICE_RADIUS_KM,
    bio: row.bio,
    skills: row.skills ?? [],
    stats: {
      rating: Number(row.rating ?? 0),
      reviewCount: row.review_count ?? 0,
      jobsCompleted: row.jobs_completed ?? 0,
      responseRate: row.response_rate ?? 0
    }
  }
}

export async function ensureUserProfile (
  db: Pool,
  user: AuthenticatedUser
): Promise<UserProfile> {
  const defaultDisplayName = deriveDisplayName(user)

  await db.query(
    `
      insert into public.profiles (id, display_name)
      values ($1, $2)
      on conflict (id) do nothing
    `,
    [user.id, defaultDisplayName]
  )

  await db.query(
    `
      insert into public.user_stats (user_id)
      values ($1)
      on conflict (user_id) do nothing
    `,
    [user.id]
  )

  const result = await db.query<UserProfileRow>(
    `
      select
        p.id,
        p.display_name,
        p.city,
        p.barangay,
        p.latitude,
        p.longitude,
        p.service_radius_km,
        p.bio,
        p.skills,
        us.rating,
        us.review_count,
        us.jobs_completed,
        us.response_rate
      from public.profiles p
      left join public.user_stats us on us.user_id = p.id
      where p.id = $1
    `,
    [user.id]
  )

  return mapUserProfile(result.rows[0])
}

export async function getWorkerServiceArea (
  db: Pool,
  userId: string
): Promise<{ latitude: number; longitude: number; serviceRadiusKm: number } | null> {
  const result = await db.query<Pick<UserProfileRow, 'latitude' | 'longitude' | 'service_radius_km'>>(
    `
      select
        latitude,
        longitude,
        service_radius_km
      from public.profiles
      where id = $1
    `,
    [userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  const row = result.rows[0]

  if (row.latitude == null || row.longitude == null) {
    return null
  }

  return {
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    serviceRadiusKm: row.service_radius_km ?? DEFAULT_SERVICE_RADIUS_KM
  }
}

export async function updateUserProfile (
  db: Pool,
  userId: string,
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  const profileResult = await db.query<UserProfileRow>(
    `
      update public.profiles
      set
        display_name = coalesce($2, display_name),
        city = case when $3::boolean then $4 else city end,
        barangay = case when $5::boolean then $6 else barangay end,
        latitude = case when $7::boolean then $8 else latitude end,
        longitude = case when $9::boolean then $10 else longitude end,
        service_radius_km = coalesce($11, service_radius_km),
        bio = case when $12::boolean then $13 else bio end,
        skills = case when $14::boolean then $15 else skills end,
        updated_at = now()
      where id = $1
      returning
        id,
        display_name,
        city,
        barangay,
        latitude,
        longitude,
        service_radius_km,
        bio,
        skills,
        0::numeric as rating,
        0::int as review_count,
        0::int as jobs_completed,
        0::int as response_rate
    `,
    [
      userId,
      input.displayName,
      Object.prototype.hasOwnProperty.call(input, 'city'),
      input.city ?? null,
      Object.prototype.hasOwnProperty.call(input, 'barangay'),
      input.barangay ?? null,
      Object.prototype.hasOwnProperty.call(input, 'latitude'),
      input.latitude ?? null,
      Object.prototype.hasOwnProperty.call(input, 'longitude'),
      input.longitude ?? null,
      input.serviceRadiusKm,
      Object.prototype.hasOwnProperty.call(input, 'bio'),
      input.bio ?? null,
      Object.prototype.hasOwnProperty.call(input, 'skills'),
      input.skills ?? []
    ]
  )

  const statsResult = await db.query<Pick<UserProfileRow, 'rating' | 'review_count' | 'jobs_completed' | 'response_rate'>>(
    `
      select
        rating,
        review_count,
        jobs_completed,
        response_rate
      from public.user_stats
      where user_id = $1
    `,
    [userId]
  )

  const stats = statsResult.rows[0] ?? {
    rating: 0,
    review_count: 0,
    jobs_completed: 0,
    response_rate: 0
  }

  return mapUserProfile({
    ...profileResult.rows[0],
    ...stats
  })
}

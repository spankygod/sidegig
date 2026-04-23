import { createHash } from 'node:crypto'
import type { Pool } from 'pg'
import { deriveDisplayName, type AuthenticatedUser } from '../auth/types'
import { DEFAULT_SERVICE_RADIUS_KM } from '../proximity'
import type { PublicUserProfile, UpdateUserProfileInput, UserProfile } from './types'

type UserProfileRow = {
  id: string
  display_name: string
  phone: string | null
  avatar_url: string | null
  pin_hash: string | null
  province: string | null
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
  gigs_posted: number | null
  hires_funded: number | null
  hires_completed: number | null
}

function hashPinCode(userId: string, pinCode: string): string {
  return createHash('sha256')
    .update(`${userId}:${pinCode}`)
    .digest('hex')
}

function toNullableNumber(value: string | number | null): number | null {
  if (value == null) {
    return null
  }

  return Number(value)
}

function resolvePinHash(userId: string, input: UpdateUserProfileInput): string | null | undefined {
  const shouldUpdatePin = Object.prototype.hasOwnProperty.call(input, 'pinCode')

  if (!shouldUpdatePin) {
    return undefined
  }

  if (input.pinCode == null) {
    return null
  }

  return hashPinCode(userId, input.pinCode)
}

function mapUserProfile (row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    hasPin: row.pin_hash != null && row.pin_hash.trim() !== '',
    province: row.province,
    city: row.city,
    barangay: row.barangay,
    latitude: toNullableNumber(row.latitude),
    longitude: toNullableNumber(row.longitude),
    serviceRadiusKm: row.service_radius_km ?? DEFAULT_SERVICE_RADIUS_KM,
    bio: row.bio,
    skills: row.skills ?? [],
    stats: {
      rating: Number(row.rating ?? 0),
      reviewCount: row.review_count ?? 0,
      jobsCompleted: row.jobs_completed ?? 0,
      responseRate: row.response_rate ?? 0,
      gigsPosted: row.gigs_posted ?? 0,
      hiresFunded: row.hires_funded ?? 0,
      hiresCompleted: row.hires_completed ?? 0
    }
  }
}

function mapPublicUserProfile (row: UserProfileRow): PublicUserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    province: row.province,
    city: row.city,
    barangay: row.barangay,
    bio: row.bio,
    skills: row.skills ?? [],
    stats: {
      rating: Number(row.rating ?? 0),
      reviewCount: row.review_count ?? 0,
      jobsCompleted: row.jobs_completed ?? 0,
      responseRate: row.response_rate ?? 0,
      gigsPosted: row.gigs_posted ?? 0,
      hiresFunded: row.hires_funded ?? 0,
      hiresCompleted: row.hires_completed ?? 0
    }
  }
}

export async function ensureUserProfile (
  db: Pool,
  user: AuthenticatedUser
): Promise<UserProfile> {
  const defaultDisplayName = deriveDisplayName(user)

  const result = await db.query<UserProfileRow>(
    `
      with ensured_profile as (
        insert into public.profiles (id, display_name)
        values ($1, $2)
        on conflict (id) do nothing
        returning id
      ),
      ensured_stats as (
        insert into public.user_stats (user_id)
        values ($1)
        on conflict (user_id) do nothing
        returning user_id
      )
      select
        p.id,
        p.display_name,
        p.phone,
        p.avatar_url,
        p.pin_hash,
        p.province,
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
        us.response_rate,
        us.gigs_posted,
        us.hires_funded,
        us.hires_completed
      from public.profiles p
      left join public.user_stats us on us.user_id = p.id
      where p.id = $1
    `,
    [user.id, defaultDisplayName]
  )

  return mapUserProfile(result.rows[0])
}

export async function getUserProfileById (
  db: Pool,
  userId: string
): Promise<UserProfile | null> {
  const result = await db.query<UserProfileRow>(
    `
      select
        p.id,
        p.display_name,
        p.phone,
        p.avatar_url,
        p.pin_hash,
        p.province,
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
        us.response_rate,
        us.gigs_posted,
        us.hires_funded,
        us.hires_completed
      from public.profiles p
      left join public.user_stats us on us.user_id = p.id
      where p.id = $1
    `,
    [userId]
  )

  if (result.rowCount === 0) {
    return null
  }

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

export async function getPublicUserProfileById (
  db: Pool,
  userId: string
): Promise<PublicUserProfile | null> {
  const result = await db.query<UserProfileRow>(
    `
      select
        p.id,
        p.display_name,
        p.phone,
        p.avatar_url,
        p.pin_hash,
        p.province,
        p.city,
        p.barangay,
        null::numeric as latitude,
        null::numeric as longitude,
        null::int as service_radius_km,
        p.bio,
        p.skills,
        us.rating,
        us.review_count,
        us.jobs_completed,
        us.response_rate,
        us.gigs_posted,
        us.hires_funded,
        us.hires_completed
      from public.profiles p
      left join public.user_stats us on us.user_id = p.id
      where p.id = $1
    `,
    [userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapPublicUserProfile(result.rows[0])
}

export async function updateUserProfile (
  db: Pool,
  userId: string,
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  const normalizedPinHash = resolvePinHash(userId, input)

  const profileResult = await db.query<UserProfileRow>(
    `
      update public.profiles
      set
        display_name = coalesce($2, display_name),
        phone = case when $3::boolean then $4 else phone end,
        avatar_url = case when $5::boolean then $6 else avatar_url end,
        pin_hash = case when $7::boolean then $8 else pin_hash end,
        province = case when $9::boolean then $10 else province end,
        city = case when $11::boolean then $12 else city end,
        barangay = case when $13::boolean then $14 else barangay end,
        latitude = case when $15::boolean then $16 else latitude end,
        longitude = case when $17::boolean then $18 else longitude end,
        service_radius_km = coalesce($19, service_radius_km),
        bio = case when $20::boolean then $21 else bio end,
        skills = case when $22::boolean then $23 else skills end,
        updated_at = now()
      where id = $1
      returning
        id,
        display_name,
        phone,
        avatar_url,
        pin_hash,
        province,
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
        0::int as response_rate,
        0::int as gigs_posted,
        0::int as hires_funded,
        0::int as hires_completed
    `,
    [
      userId,
      input.displayName,
      Object.prototype.hasOwnProperty.call(input, 'phone'),
      input.phone ?? null,
      Object.prototype.hasOwnProperty.call(input, 'avatarUrl'),
      input.avatarUrl ?? null,
      Object.prototype.hasOwnProperty.call(input, 'pinCode'),
      normalizedPinHash ?? null,
      Object.prototype.hasOwnProperty.call(input, 'province'),
      input.province ?? null,
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

  const statsResult = await db.query<Pick<UserProfileRow, 'rating' | 'review_count' | 'jobs_completed' | 'response_rate' | 'gigs_posted' | 'hires_funded' | 'hires_completed'>>(
    `
      select
        rating,
        review_count,
        jobs_completed,
        response_rate,
        gigs_posted,
        hires_funded,
        hires_completed
      from public.user_stats
      where user_id = $1
    `,
    [userId]
  )

  const stats = statsResult.rows[0] ?? {
    rating: 0,
    review_count: 0,
    jobs_completed: 0,
    response_rate: 0,
    gigs_posted: 0,
    hires_funded: 0,
    hires_completed: 0
  }

  return mapUserProfile({
    ...profileResult.rows[0],
    ...stats
  })
}

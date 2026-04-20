import { DEFAULT_GIG_APPLICATION_RADIUS_KM, DEFAULT_SERVICE_RADIUS_KM } from '../proximity'

export const GIG_CATEGORIES = [
  'errands_personal_assistance',
  'cleaning_home_help',
  'moving_help',
  'construction_helper',
  'tutoring_academic_support',
  'graphic_design_creative',
  'photo_video_support',
  'virtual_assistance_admin',
  'event_staffing'
] as const

export const DURATION_BUCKETS = [
  'same_day',
  'two_to_seven_days',
  'eight_to_fourteen_days',
  'fifteen_to_thirty_days'
] as const

export const GIG_STATUSES = [
  'draft',
  'published',
  'funded',
  'in_progress',
  'completed',
  'disputed',
  'cancelled',
  'closed'
] as const

export const MANAGEABLE_GIG_STATUSES = [
  'draft',
  'published',
  'closed',
  'cancelled'
] as const

export type GigCategory = typeof GIG_CATEGORIES[number]
export type DurationBucket = typeof DURATION_BUCKETS[number]
export type GigStatus = typeof GIG_STATUSES[number]
export type ManageableGigStatus = typeof MANAGEABLE_GIG_STATUSES[number]

export interface CreateGigInput {
  title: string
  category: GigCategory
  description: string
  priceAmount: number
  durationBucket: DurationBucket
  city: string
  barangay: string
  latitude: number
  longitude: number
  applicationRadiusKm?: number
  scheduleSummary: string
  startsAt?: string | null
  endsAt?: string | null
  status?: Extract<GigStatus, 'draft' | 'published'>
}

export interface UpdateGigInput {
  title?: string
  category?: GigCategory
  description?: string
  priceAmount?: number
  durationBucket?: DurationBucket
  city?: string
  barangay?: string
  latitude?: number
  longitude?: number
  applicationRadiusKm?: number
  scheduleSummary?: string
  startsAt?: string | null
  endsAt?: string | null
  status?: ManageableGigStatus
}

export interface GigListFilters {
  category?: GigCategory
  city?: string
  q?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  offset?: number
  limit: number
}

export interface PublicGigListResult {
  gigs: PublicGig[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface PublicGig {
  id: string
  title: string
  category: GigCategory
  description: string
  priceAmount: number
  currency: 'PHP'
  durationBucket: DurationBucket
  status: GigStatus
  applicationRadiusKm: number
  distanceKm: number | null
  scheduleSummary: string
  startsAt: string | null
  endsAt: string | null
  location: {
    city: string
    barangay: string
    exactPinVisible: false
  }
  poster: {
    id: string
    displayName: string
    rating: number
    reviewCount: number
    jobsCompleted: number
    responseRate: number
    gigsPosted: number
    hiresFunded: number
    hiresCompleted: number
  }
  createdAt: string
}

export interface CreatedGig extends Omit<PublicGig, 'location'> {
  location: {
    city: string
    barangay: string
    latitude: number
    longitude: number
    exactPinVisible: true
  }
}

export interface OwnedGig extends Omit<CreatedGig, 'poster' | 'distanceKm'> {
  distanceKm: null
  applicationCount: number
  updatedAt: string
}

export {
  DEFAULT_GIG_APPLICATION_RADIUS_KM,
  DEFAULT_SERVICE_RADIUS_KM
}

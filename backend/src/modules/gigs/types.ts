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

export type GigCategory = typeof GIG_CATEGORIES[number]
export type DurationBucket = typeof DURATION_BUCKETS[number]

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
  scheduleSummary: string
  supervisorPresent?: boolean
  ppeProvided?: boolean
  helperOnlyConfirmation?: boolean
  physicalLoad?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

export interface GigListFilters {
  category?: GigCategory
  city?: string
  limit: number
}

export interface PublicGig {
  id: string
  title: string
  category: GigCategory
  description: string
  priceAmount: number
  currency: 'PHP'
  durationBucket: DurationBucket
  status: string
  scheduleSummary: string
  location: {
    city: string
    barangay: string
    exactPinVisible: false
  }
  construction: {
    supervisorPresent: boolean
    ppeProvided: boolean
    helperOnlyConfirmation: boolean
    physicalLoad: string | null
  } | null
  poster: {
    id: string
    displayName: string
    rating: number
    reviewCount: number
    jobsCompleted: number
    responseRate: number
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

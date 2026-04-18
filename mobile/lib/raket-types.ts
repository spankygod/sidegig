export const gigCategories = [
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

export const durationBuckets = [
  'same_day',
  'two_to_seven_days',
  'eight_to_fourteen_days',
  'fifteen_to_thirty_days'
] as const

export type GigCategory = typeof gigCategories[number]
export type DurationBucket = typeof durationBuckets[number]

export interface BackendAuthUser {
  id: string
  email: string | null
  phone: string | null
  isAnonymous: boolean
  appMetadata: Record<string, unknown>
  userMetadata: Record<string, unknown>
}

export interface UserProfile {
  id: string
  displayName: string
  city: string | null
  barangay: string | null
  latitude: number | null
  longitude: number | null
  serviceRadiusKm: number
  bio: string | null
  skills: string[]
  stats: {
    rating: number
    reviewCount: number
    jobsCompleted: number
    responseRate: number
  }
}

export interface OwnedGig {
  id: string
  title: string
  category: GigCategory
  description: string
  priceAmount: number
  currency: 'PHP'
  durationBucket: DurationBucket
  status: string
  applicationRadiusKm: number
  distanceKm: null
  scheduleSummary: string
  startsAt: string | null
  endsAt: string | null
  location: {
    city: string
    barangay: string
    latitude: number
    longitude: number
    exactPinVisible: true
  }
  construction: {
    supervisorPresent: boolean
    ppeProvided: boolean
    helperOnlyConfirmation: boolean
    physicalLoad: string | null
  } | null
  applicationCount: number
  updatedAt: string
  createdAt: string
}

export interface CreateGigPayload {
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
  supervisorPresent?: boolean
  ppeProvided?: boolean
  helperOnlyConfirmation?: boolean
  physicalLoad?: string | null
  startsAt?: string | null
  endsAt?: string | null
  status?: 'draft' | 'published'
}

const categoryLabels: Record<GigCategory, string> = {
  errands_personal_assistance: 'Errands',
  cleaning_home_help: 'Cleaning',
  moving_help: 'Moving',
  construction_helper: 'Construction',
  tutoring_academic_support: 'Tutoring',
  graphic_design_creative: 'Graphic design',
  photo_video_support: 'Photo and video',
  virtual_assistance_admin: 'Virtual assistance',
  event_staffing: 'Events'
}

const durationLabels: Record<DurationBucket, string> = {
  same_day: 'Same day',
  two_to_seven_days: '2 to 7 days',
  eight_to_fourteen_days: '8 to 14 days',
  fifteen_to_thirty_days: '15 to 30 days'
}

export function formatGigCategory (category: GigCategory): string {
  return categoryLabels[category]
}

export function formatDurationBucket (durationBucket: DurationBucket): string {
  return durationLabels[durationBucket]
}

export function formatPhpCurrency (amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatGigTimestamp (value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

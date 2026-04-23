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
  phone: string | null
  avatarUrl: string | null
  hasPin: boolean
  province: string | null
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
    gigsPosted: number
    hiresFunded: number
    hiresCompleted: number
  }
}

export interface UpdateProfilePayload {
  displayName?: string
  phone?: string | null
  avatarUrl?: string | null
  pinCode?: string | null
  province?: string | null
  city?: string | null
  barangay?: string | null
  latitude?: number | null
  longitude?: number | null
  serviceRadiusKm?: number
  bio?: string | null
  skills?: string[]
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
  applicationCount: number
  updatedAt: string
  createdAt: string
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

export interface PublicGigFeedPage {
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface PublicGigFeedResult {
  gigs: PublicGig[]
  page: PublicGigFeedPage
}

export interface CreateGigApplicationPayload {
  gigId: string
  intro: string
  availability: string
}

export interface GigApplicationSummary {
  id: string
  status: 'submitted' | 'rejected' | 'withdrawn' | 'hired' | 'closed'
  intro: string
  availability: string
  createdAt: string
  gig: {
    id: string
    title: string
    category: string
    city: string
    barangay: string
    status: string
  }
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

const phpAmountFormatter = new Intl.NumberFormat('en-PH', {
  maximumFractionDigits: 0
})

const gigTimestampFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

export function formatGigCategory (category: GigCategory): string {
  return categoryLabels[category]
}

export function formatDurationBucket (durationBucket: DurationBucket): string {
  return durationLabels[durationBucket]
}

export function formatPhpAmount (amount: number): string {
  return `₱${phpAmountFormatter.format(amount)}`
}

export function formatGigTimestamp (value: string): string {
  return gigTimestampFormatter.format(new Date(value))
}

function hasProfileValue(value: string | null | undefined): boolean {
  return value != null && value.trim() !== ''
}

export function isProfileOnboardingComplete(profile: UserProfile | null | undefined): boolean {
  if (profile == null) {
    return false
  }

  return hasProfileValue(profile.displayName) &&
    hasProfileValue(profile.phone) &&
    profile.hasPin &&
    hasProfileValue(profile.avatarUrl) &&
    hasProfileValue(profile.province) &&
    hasProfileValue(profile.city) &&
    hasProfileValue(profile.barangay)
}

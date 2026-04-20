export const HIRE_STATUSES = [
  'pending_funding',
  'funded',
  'accepted',
  'in_progress',
  'worker_marked_done',
  'poster_accepted',
  'disputed',
  'refunded',
  'payout_ready',
  'paid_out'
] as const

export type HireStatus = typeof HIRE_STATUSES[number]

export interface HireSummary {
  id: string
  gigId: string
  applicationId: string
  posterId: string
  workerId: string
  status: HireStatus
  fundedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface HireWorkDetail {
  viewerRole: 'poster' | 'worker'
  hire: HireSummary
  gig: {
    id: string
    title: string
    category: string
    description: string
    priceAmount: number
    currency: 'PHP'
    durationBucket: string
    status: string
    applicationRadiusKm: number
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
    createdAt: string
    updatedAt: string
  }
  application: {
    id: string
    status: string
    intro: string
    availability: string
    createdAt: string
    updatedAt: string
  }
  poster: {
    id: string
    displayName: string
    city: string | null
    barangay: string | null
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
  worker: {
    id: string
    displayName: string
    city: string | null
    barangay: string | null
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
}

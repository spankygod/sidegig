export const APPLICATION_STATUSES = [
  'submitted',
  'rejected',
  'withdrawn',
  'hired',
  'closed'
] as const

export const REVIEWABLE_APPLICATION_STATUSES = [
  'submitted',
  'rejected'
] as const

export type ApplicationStatus = typeof APPLICATION_STATUSES[number]
export type ReviewableApplicationStatus = typeof REVIEWABLE_APPLICATION_STATUSES[number]

export interface CreateGigApplicationInput {
  gigId: string
  intro: string
  availability: string
}

export interface GigApplicationSummary {
  id: string
  status: ApplicationStatus
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

export interface PosterGigApplicationSummary {
  id: string
  status: ApplicationStatus
  intro: string
  availability: string
  createdAt: string
  updatedAt: string
  worker: {
    id: string
    displayName: string
    city: string | null
    barangay: string | null
    bio: string | null
    skills: string[]
    stats: {
      rating: number
      reviewCount: number
      jobsCompleted: number
      responseRate: number
    }
  }
}

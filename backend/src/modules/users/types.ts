export interface UserProfile {
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

export interface UpdateUserProfileInput {
  displayName?: string
  city?: string | null
  barangay?: string | null
  bio?: string | null
  skills?: string[]
}

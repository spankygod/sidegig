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

export interface PublicUserProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  province: string | null
  city: string | null
  barangay: string | null
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

export interface UpdateUserProfileInput {
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

export interface ReviewSummary {
  id: string
  hireId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  reviewer: {
    id: string
    displayName: string
    city: string | null
    barangay: string | null
  }
}

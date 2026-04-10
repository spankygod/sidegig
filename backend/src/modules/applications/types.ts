export interface CreateGigApplicationInput {
  gigId: string
  intro: string
  availability: string
}

export interface GigApplicationSummary {
  id: string
  status: string
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

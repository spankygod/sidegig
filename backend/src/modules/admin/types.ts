export interface AdminOverview {
  users: number
  publishedGigs: number
  totalGigs: number
  applications: number
  activeHires: number
  openDisputes: number
  paidPayments: number
  pendingPayouts: number
}

export interface AdminGigSummary {
  id: string
  posterId: string
  posterDisplayName: string
  title: string
  category: string
  status: string
  city: string
  barangay: string
  priceAmount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export interface AdminDisputeSummary {
  id: string
  hireId: string
  openedBy: string
  posterId: string
  workerId: string
  reason: string
  status: string
  createdAt: string
  updatedAt: string
}

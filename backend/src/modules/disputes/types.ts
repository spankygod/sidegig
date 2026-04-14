import type { HireSummary } from '../hires/types'

export const DISPUTE_STATUSES = [
  'open',
  'under_review',
  'resolved',
  'cancelled'
] as const

export type DisputeStatus = typeof DISPUTE_STATUSES[number]

export interface DisputeSummary {
  id: string
  hireId: string
  openedBy: string
  posterId: string
  workerId: string
  reason: string
  details: string | null
  status: DisputeStatus
  resolution: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OpenHireDisputeResult {
  hire: HireSummary
  dispute: DisputeSummary
}

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

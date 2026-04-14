export const HIRE_MILESTONE_STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'cancelled'
] as const

export type HireMilestoneStatus = typeof HIRE_MILESTONE_STATUSES[number]

export interface HireMilestoneSummary {
  id: string
  hireId: string
  createdBy: string
  title: string
  description: string | null
  status: HireMilestoneStatus
  dueAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

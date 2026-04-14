export const PAYMENT_STATUSES = [
  'paid',
  'refunded',
  'failed'
] as const

export const PAYOUT_STATUSES = [
  'pending',
  'paid',
  'cancelled'
] as const

export type PaymentStatus = typeof PAYMENT_STATUSES[number]
export type PayoutStatus = typeof PAYOUT_STATUSES[number]

export interface PaymentSummary {
  id: string
  hireId: string
  payerId: string
  payeeId: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  providerReference: string | null
  paidAt: string
  refundedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PayoutSummary {
  id: string
  hireId: string
  paymentId: string
  workerId: string
  amount: number
  currency: string
  status: PayoutStatus
  providerReference: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

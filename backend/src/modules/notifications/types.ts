export const NOTIFICATION_TYPES = [
  'application_received',
  'application_reviewed',
  'hire_updated',
  'chat_message',
  'dispute_opened',
  'review_received',
  'system'
] as const

export type NotificationType = typeof NOTIFICATION_TYPES[number]

export interface NotificationSummary {
  id: string
  userId: string
  actorId: string | null
  type: NotificationType
  entityType: string
  entityId: string | null
  title: string
  body: string
  readAt: string | null
  createdAt: string
}

export interface CreateNotificationInput {
  userId: string
  actorId?: string | null
  type: NotificationType
  entityType: string
  entityId?: string | null
  title: string
  body: string
}

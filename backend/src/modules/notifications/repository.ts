import type { Pool } from 'pg'
import type { CreateNotificationInput, NotificationSummary, NotificationType } from './types'

type NotificationRow = {
  id: string
  user_id: string
  actor_id: string | null
  type: NotificationType
  entity_type: string
  entity_id: string | null
  title: string
  body: string
  read_at: Date | string | null
  created_at: Date | string
}

function toIsoString (value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString()
}

function mapNotification (row: NotificationRow): NotificationSummary {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    type: row.type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: row.title,
    body: row.body,
    readAt: row.read_at == null ? null : toIsoString(row.read_at),
    createdAt: toIsoString(row.created_at)
  }
}

export async function createNotification (
  db: Pool,
  input: CreateNotificationInput
): Promise<NotificationSummary> {
  const result = await db.query<NotificationRow>(
    `
      insert into public.notifications (
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        title,
        body
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      returning
        id,
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        title,
        body,
        read_at,
        created_at
    `,
    [
      input.userId,
      input.actorId ?? null,
      input.type,
      input.entityType,
      input.entityId ?? null,
      input.title,
      input.body
    ]
  )

  return mapNotification(result.rows[0])
}

export async function listUserNotifications (
  db: Pool,
  input: {
    userId: string
    unreadOnly?: boolean
    limit?: number
  }
): Promise<NotificationSummary[]> {
  const conditions = ['user_id = $1']
  const values: Array<string | number> = [input.userId]

  if (input.unreadOnly === true) {
    conditions.push('read_at is null')
  }

  values.push(input.limit ?? 50)

  const result = await db.query<NotificationRow>(
    `
      select
        id,
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        title,
        body,
        read_at,
        created_at
      from public.notifications
      where ${conditions.join(' and ')}
      order by created_at desc
      limit $${values.length}
    `,
    values
  )

  return result.rows.map(mapNotification)
}

export async function markNotificationRead (
  db: Pool,
  input: {
    notificationId: string
    userId: string
  }
): Promise<NotificationSummary | null> {
  const result = await db.query<NotificationRow>(
    `
      update public.notifications
      set read_at = coalesce(read_at, now())
      where id = $1
        and user_id = $2
      returning
        id,
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        title,
        body,
        read_at,
        created_at
    `,
    [input.notificationId, input.userId]
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapNotification(result.rows[0])
}

export async function markAllNotificationsRead (
  db: Pool,
  userId: string
): Promise<number> {
  const result = await db.query(
    `
      update public.notifications
      set read_at = coalesce(read_at, now())
      where user_id = $1
        and read_at is null
    `,
    [userId]
  )

  return result.rowCount ?? 0
}

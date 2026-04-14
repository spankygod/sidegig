import { request } from './client';
import type { NotificationSummary } from './types';

export async function fetchNotifications(
  baseUrl: string,
  token: string,
  filters?: {
    limit?: number;
    unreadOnly?: boolean;
  }
): Promise<NotificationSummary[]> {
  const response = await request<{ notifications: NotificationSummary[] }>(baseUrl, '/v1/notifications', {
    token,
    query: {
      limit: filters?.limit,
      unreadOnly: filters?.unreadOnly,
    },
  });

  return response.notifications;
}

export async function markNotificationRead(
  baseUrl: string,
  token: string,
  notificationId: string
): Promise<NotificationSummary> {
  const response = await request<{ notification: NotificationSummary }>(
    baseUrl,
    `/v1/notifications/${notificationId}/read`,
    {
      method: 'POST',
      token,
    }
  );

  return response.notification;
}

export async function markAllNotificationsRead(baseUrl: string, token: string): Promise<number> {
  const response = await request<{ updatedCount: number }>(baseUrl, '/v1/notifications/read-all', {
    method: 'POST',
    token,
  });

  return response.updatedCount;
}

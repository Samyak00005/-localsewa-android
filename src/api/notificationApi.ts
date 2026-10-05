import { AppNotification, NotificationFeed } from '../types/notification';
import { apiRequest } from './apiClient';

type ApiRecord = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableText(value: unknown): string | null {
  const result = text(value).trim();

  return result || null;
}

function number(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNotification(value: unknown): AppNotification | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const row = value as ApiRecord;

  const id = number(row.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    type: text(row.type).trim().toLowerCase() || 'general',
    title: text(row.title).trim() || 'Localsewa',
    message: text(row.message).trim(),
    actionUrl: nullableText(row.actionUrl),
    entityType: nullableText(row.entityType),
    entityId: nullableText(row.entityId),
    read: Boolean(row.read),
    readAt: nullableText(row.readAt),
    createdAt: text(row.createdAt),
  };
}

export const notificationApi = {
  async list(token: string, limit = 50): Promise<NotificationFeed> {
    const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));

    const result = await apiRequest<{
      success: true;
      notifications: unknown[];
      unreadCount?: unknown;
      serverTime?: unknown;
    }>(`/api/notifications?limit=${safeLimit}`, { token });

    const notifications = Array.isArray(result.notifications)
      ? result.notifications
          .map(parseNotification)
          .filter((item): item is AppNotification => Boolean(item))
      : [];

    const serverUnread = number(result.unreadCount);

    return {
      notifications,
      unreadCount: Number.isFinite(serverUnread)
        ? Math.max(0, serverUnread)
        : notifications.filter(item => !item.read).length,
      serverTime: nullableText(result.serverTime),
    };
  },

  async markRead(notificationId: number, token: string): Promise<void> {
    await apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      token,
    });
  },

  async markAllRead(token: string): Promise<void> {
    await apiRequest('/api/notifications/read-all', {
      method: 'PATCH',
      token,
    });
  },
};

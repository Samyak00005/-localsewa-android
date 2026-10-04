export type AppNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationFeed = {
  notifications: AppNotification[];
  unreadCount: number;
  serverTime: string | null;
};

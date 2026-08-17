export type NotificationType = "exercise" | "social" | "streak" | "reminder" | "achievement" | "system";

export interface NotificationItem {
  createdAt: string;
  description?: string;
  id: string;
  isRead: boolean;
  title: string;
  type: NotificationType;
}

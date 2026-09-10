import type { NotificationItem } from "@/types/notification";

export const notificationsMock: NotificationItem[] = [
  { id: "notification-1", type: "exercise", title: "Nuevo ejercicio recomendado", description: "Duración 5 min", createdAt: "2026-08-11T08:30:00", isRead: false },
  { id: "notification-2", type: "social", title: "¡Nuevo post!", description: "Instagram", createdAt: "2026-08-11T07:45:00", isRead: false },
  { id: "notification-3", type: "streak", title: "¡Mantén tu RACHA!", description: "7 días", createdAt: "2026-08-10T20:00:00", isRead: true },
  { id: "notification-4", type: "reminder", title: "Un momento para ti", description: "Continúa con tu siguiente ejercicio.", createdAt: "2026-08-10T12:00:00", isRead: true },
  { id: "notification-5", type: "achievement", title: "Nuevo avance registrado", description: "Completaste un ejercicio de Puerta 1.", createdAt: "2026-08-09T19:20:00", isRead: true },
  { id: "notification-6", type: "system", title: "Sigue avanzando", description: "Cada pequeño paso forma parte de tu camino.", createdAt: "2026-08-08T09:00:00", isRead: true },
];

export function getUnreadNotificationsCount(): number {
  return notificationsMock.filter(notification => !notification.isRead).length;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    data?: any;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            setNotifications: (notifications) => {
                set({
                    notifications,
                    unreadCount: notifications.filter((n) => !n.read).length,
                });
            },

            addNotification: (notification) => {
                const current = get().notifications;
                const updated = [notification, ...current];
                set({
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length,
                });
            },

            markAsRead: (id) => {
                const current = get().notifications;
                const updated = current.map((n) =>
                    n.id === id ? { ...n, read: true } : n
                );
                set({
                    notifications: updated,
                    unreadCount: updated.filter((n) => !n.read).length,
                });
            },

            markAllAsRead: () => {
                const current = get().notifications;
                const updated = current.map((n) => ({ ...n, read: true }));
                set({
                    notifications: updated,
                    unreadCount: 0,
                });
            },

            clearNotifications: () => {
                set({ notifications: [], unreadCount: 0 });
            },
        }),
        {
            name: 'notification-storage',
        }
    )
);

import { create } from 'zustand';
import { NotificationItem } from '../types';
import { apiRequest } from '../services/api';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<NotificationItem[]>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<NotificationItem[]>('/notifications');
      const unread = data.filter((n) => !n.read).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
      return [];
    }
  },

  markAsRead: async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        const unread = updated.filter((n) => !n.read).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiRequest('/notifications/read-all', {
        method: 'POST',
      });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  clearError: () => set({ error: null }),
}));

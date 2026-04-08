import apiClient from './apiClient';
import { handleAPIError } from './apiErrorHandler';

export const notificationApi = {
    listNotifications: async (page = 1) => {
        try {
            const response = await apiClient.get(`/api/notifications/?page=${page}`);
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'List Notifications');
        }
    },

    markAsRead: async (id: number) => {
        try {
            const response = await apiClient.patch(`/api/notifications/${id}/`, { is_read: true });
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Mark Notification Read');
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await apiClient.post('/api/notifications/mark_all_as_read/');
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Mark All Notifications Read');
        }
    },

    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/api/notifications/unread_count/');
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Get Unread Count');
        }
    },
};


import apiClient from './apiClient';
import { USER_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { User } from '@/types';

export interface UpdateProfileData {
    username?: string;
    number?: string;
    location?: string;
    image?: any;
}

export const usersApi = {
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await apiClient.get<User>(USER_ENDPOINTS.ME);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Current User');
        }
    },

    updateProfile: async (data: UpdateProfileData): Promise<User> => {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            const response = await apiClient.patch<User>(USER_ENDPOINTS.UPDATE_PROFILE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Update Profile');
        }
    },

    getUserById: async (userId: string): Promise<User> => {
        try {
            const response = await apiClient.get<User>(USER_ENDPOINTS.GET_USER_DETAIL(userId));
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get User Details');
        }
    },
};

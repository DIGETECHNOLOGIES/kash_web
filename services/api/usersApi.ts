/**
 * User Profile API Service
 * Handles user profile management and user listing
 * 
 * @docs /api/users/
 */

import apiClient from './apiClient';
import { USER_ENDPOINTS, PAGINATION } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

interface User {
    id: string;
    username: string;
    email: string;
    number: string;
    location?: string;
    image?: string;
    is_seller: boolean;
    referred_by?: string;
    date_joined?: string;
    has_shop?: boolean;
}

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const usersApi = {
    /**
     * Get current authenticated user profile
     */
    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await apiClient.get<User>(USER_ENDPOINTS.ME);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Current User');
        }
    },

    /**
     * Update current user profile
     */
    updateProfile: async (data: any): Promise<User> => {
        try {
            let payload = data;
            let headers = {};

            // Handle image upload with FormData
            const shouldUseFormData = Object.values(data).some(
                (val) => val instanceof File || val instanceof Blob
            );

            if (shouldUseFormData) {
                const formData = new FormData();
                Object.keys(data).forEach((key) => {
                    if (data[key] !== undefined && data[key] !== null) {
                        formData.append(key, data[key]);
                    }
                });
                payload = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            const response = await apiClient.patch<User>(
                USER_ENDPOINTS.UPDATE_PROFILE,
                payload,
                { headers }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Update Profile');
        }
    },

    /**
     * List all users
     */
    listUsers: async (
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<User>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<User>>(
                USER_ENDPOINTS.LIST_USERS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Users');
        }
    },

    /**
     * Get specific user details
     */
    getUserById: async (userId: string): Promise<User> => {
        try {
            const response = await apiClient.get<User>(
                USER_ENDPOINTS.GET_USER_DETAIL(userId)
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get User Details');
        }
    },

    /**
     * Search users by criteria
     */
    searchUsers: async (query: string): Promise<PaginatedResponse<User>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<User>>(
                USER_ENDPOINTS.LIST_USERS,
                {
                    params: { search: query },
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Search Users');
        }
    },

    /**
     * Update current user push token
     */
    updatePushToken: async (token: string): Promise<{ status: string }> => {
        try {
            const response = await apiClient.post<{ status: string }>(
                USER_ENDPOINTS.UPDATE_PUSH_TOKEN,
                { push_token: token }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Update Push Token');
        }
    },
};

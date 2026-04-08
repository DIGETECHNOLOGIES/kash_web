/**
 * Authentication API Service
 * Handles user authentication, OTP verification, and password management
 * 
 * @docs /api/users/
 */

import apiClient from './apiClient';
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

interface LoginResponse {
    access: string;
    refresh: string;
}

interface LoginErrorResponse {
    detail: string;
    next?: string;
}

interface RegisterResponse {
    id?: string;
    email: string;
    username: string;
    number: string;
    location: string;
}

interface VerifyOTPResponse {
    detail: string;
    access?: string;
}

interface PasswordResetResponse {
    detail: string;
}

export const authApi = {
    /**
     * Login user with email and password
     */
    login: async (
        email: string,
        password: string
    ): Promise<LoginResponse | LoginErrorResponse> => {
        try {
            const response = await apiClient.post<LoginResponse>(
                AUTH_ENDPOINTS.LOGIN,
                { email, password }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                return error.response.data as LoginErrorResponse;
            }
            throw handleAPIError(error, 'Login');
        }
    },

    /**
     * Register new user account
     */
    register: async (userData: {
        email: string;
        username: string;
        password: string;
        number: string;
        location: string;
    }): Promise<RegisterResponse> => {
        try {
            const response = await apiClient.post<RegisterResponse>(
                AUTH_ENDPOINTS.REGISTER,
                userData
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Register');
        }
    },

    /**
     * Verify email with OTP code
     */
    verifyOtp: async (email: string, code: string): Promise<VerifyOTPResponse> => {
        try {
            const response = await apiClient.post<VerifyOTPResponse>(
                AUTH_ENDPOINTS.VERIFY_OTP,
                { email, code }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Verify OTP');
        }
    },

    /**
     * Resend OTP code to email
     */
    resendOtp: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                AUTH_ENDPOINTS.RESEND_OTP,
                { email }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Resend OTP');
        }
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                AUTH_ENDPOINTS.FORGOT_PASSWORD,
                { email }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Forgot Password');
        }
    },

    /**
     * Verify reset code and update password
     */
    resetPassword: async (
        newPassword: string,
        confirmPassword: string
    ): Promise<PasswordResetResponse> => {
        try {
            const response = await apiClient.post<PasswordResetResponse>(
                AUTH_ENDPOINTS.RESET_PASSWORD,
                { new_password: newPassword, confirm_password: confirmPassword }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Reset Password');
        }
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
        try {
            const response = await apiClient.post<{ access: string }>(
                AUTH_ENDPOINTS.TOKEN_REFRESH,
                { refresh: refreshToken }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Refresh Token');
        }
    },

    /**
     * Verify authentication token
     */
    verifyToken: async (token: string): Promise<{ valid: boolean }> => {
        try {
            await apiClient.post(
                AUTH_ENDPOINTS.TOKEN_VERIFY,
                { token }
            );
            return { valid: true };
        } catch (error: any) {
            throw handleAPIError(error, 'Verify Token');
        }
    },

    /**
     * Get the currently authenticated user's profile
     */
    getMe: async (): Promise<any> => {
        try {
            const response = await apiClient.get(USER_ENDPOINTS.ME);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Me');
        }
    },

    /**
     * Update the authenticated user's profile
     */
    updateMe: async (data: FormData | Record<string, any>): Promise<any> => {
        try {
            const isFormData = data instanceof FormData;
            const response = await apiClient.patch(USER_ENDPOINTS.UPDATE_PROFILE, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
            });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Update Profile');
        }
    },
};

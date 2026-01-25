/**
 * Authentication API Service
 * Handles user authentication, OTP verification, and password management
 */

import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from './apiConstants';
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
}

interface PasswordResetResponse {
    detail: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse | LoginErrorResponse> => {
        try {
            const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, { email, password });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                return error.response.data as LoginErrorResponse;
            }
            throw handleAPIError(error, 'Login');
        }
    },

    register: async (userData: {
        email: string;
        username: string;
        password: string;
        number: string;
        location: string;
    }): Promise<RegisterResponse> => {
        try {
            const response = await apiClient.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, userData);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Register');
        }
    },

    verifyOtp: async (email: string, code: string): Promise<VerifyOTPResponse> => {
        try {
            const response = await apiClient.post<VerifyOTPResponse>(AUTH_ENDPOINTS.VERIFY_OTP, { email, code });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Verify OTP');
        }
    },

    resendOtp: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(AUTH_ENDPOINTS.RESEND_OTP, { email });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Resend OTP');
        }
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Forgot Password');
        }
    },

    resetPassword: async (email: string, code: string, newPassword: string): Promise<PasswordResetResponse> => {
        try {
            const response = await apiClient.post<PasswordResetResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, { email, code, new_password: newPassword });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Reset Password');
        }
    },

    refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
        try {
            const response = await apiClient.post<{ access: string }>(AUTH_ENDPOINTS.TOKEN_REFRESH, { refresh: refreshToken });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Refresh Token');
        }
    },

    verifyToken: async (token: string): Promise<{ valid: boolean }> => {
        try {
            await apiClient.post(AUTH_ENDPOINTS.TOKEN_VERIFY, { token });
            return { valid: true };
        } catch (error: any) {
            throw handleAPIError(error, 'Verify Token');
        }
    },
};

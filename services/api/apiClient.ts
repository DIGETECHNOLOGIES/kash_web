import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { AUTH_ENDPOINTS } from './apiConstants';
import { storage } from '@/services/storage';

/**
 * Professional API Client for Web with:
 * - Request/Response interceptors
 * - Automatic token injection
 * - Retry logic with exponential backoff
 * - Token refresh handling
 * - Request/Response logging
 * - Standardized error handling
 */

interface RetryConfig extends InternalAxiosRequestConfig {
    retryCount?: number;
    retryDelay?: number;
}

const IS_DEV = process.env.NODE_ENV === 'development';

class APIClient {
    private instance: AxiosInstance;
    private isRefreshingToken = false;
    private refreshSubscribers: Array<(token: string) => void> = [];

    constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
        this.instance = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }

    /**
     * Setup request interceptor to inject authorization token
     */
    private setupRequestInterceptor(): void {
        this.instance.interceptors.request.use(
            async (config: RetryConfig) => {
                // Get token from storage
                const token = storage.getItem('token');

                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Log request in development
                if (IS_DEV) {
                    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
                    if (config.data) console.log('[Request Body]', config.data);
                }

                return config;
            },
            (error: AxiosError) => {
                if (IS_DEV) {
                    console.error('[Request Interceptor Error]', error);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Setup response interceptor with auto-retry and token refresh
     */
    private setupResponseInterceptor(): void {
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                if (IS_DEV) {
                    console.log(`[API Response] ${response.status} ${response.config.url}`);
                }
                return response;
            },
            async (error: AxiosError) => {
                const config = error.config as RetryConfig;
                const requestUrl = config?.url || '';
                const authRoutes = [
                    AUTH_ENDPOINTS.LOGIN,
                    AUTH_ENDPOINTS.TOKEN_REFRESH,
                    AUTH_ENDPOINTS.REGISTER,
                    AUTH_ENDPOINTS.VERIFY_OTP,
                    AUTH_ENDPOINTS.RESEND_OTP,
                    AUTH_ENDPOINTS.FORGOT_PASSWORD,
                    AUTH_ENDPOINTS.RESET_PASSWORD,
                ];
                const isAuthRoute = authRoutes.some((r) => requestUrl.includes(r));

                // Handle authentication errors
                if (error.response?.status === 401) {
                    // Do not attempt token refresh for authentication routes
                    if (isAuthRoute) {
                        return Promise.reject(error);
                    }
                    if (!this.isRefreshingToken) {
                        this.isRefreshingToken = true;

                        try {
                            // Attempt to refresh token
                            const newToken = await this.refreshToken();

                            if (newToken) {
                                this.isRefreshingToken = false;
                                this.onRefreshed(newToken);

                                // Retry original request with new token
                                return this.instance.request(config);
                            }

                            this.isRefreshingToken = false;
                            await this.handleAuthenticationFailure();
                            return Promise.reject(new Error('Unable to refresh token'));
                        } catch (refreshError) {
                            this.isRefreshingToken = false;
                            await this.handleAuthenticationFailure();
                            return Promise.reject(refreshError);
                        }
                    } else {
                        // Wait for token refresh and retry
                        return new Promise((resolve) => {
                            this.addRefreshSubscriber((token: string) => {
                                if (config.headers) {
                                    config.headers.Authorization = `Bearer ${token}`;
                                }
                                resolve(this.instance.request(config));
                            });
                        });
                    }
                }

                // Handle rate limiting with exponential backoff
                if (error.response?.status === 429) {
                    return this.retryWithBackoff(config);
                }

                // Handle timeout errors with retry
                if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
                    return this.retryWithBackoff(config);
                }

                // Log error in development
                if (IS_DEV) {
                    console.error('[API Error]', {
                        status: error.response?.status,
                        url: error.config?.url,
                        message: error.message,
                        data: error.response?.data,
                    });
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Retry request with exponential backoff
     */
    private async retryWithBackoff(config: RetryConfig): Promise<AxiosResponse> {
        const retryCount = (config.retryCount || 0) + 1;
        const maxRetries = 3;

        if (retryCount > maxRetries) {
            return Promise.reject(new Error('Max retries exceeded'));
        }

        const delay = Math.pow(2, retryCount - 1) * 1000; // Exponential backoff

        return new Promise((resolve) => {
            setTimeout(async () => {
                config.retryCount = retryCount;
                try {
                    const response = await this.instance.request(config);
                    resolve(response);
                } catch (error) {
                    if (error instanceof AxiosError && error.code === 'ECONNABORTED') {
                        resolve(await this.retryWithBackoff(config));
                    } else {
                        throw error;
                    }
                }
            }, delay);
        });
    }

    /**
     * Attempt to refresh authentication token
     */
    private async refreshToken(): Promise<string | null> {
        try {
            const refreshTokenValue = storage.getItem('refreshToken');

            if (!refreshTokenValue) {
                throw new Error('No refresh token available');
            }

            const refreshUrl = `${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.TOKEN_REFRESH}`;
            const response = await axios.post(refreshUrl, { refresh: refreshTokenValue });

            const newToken = response.data?.access;

            if (newToken) {
                storage.setItem('token', newToken);
            }

            return newToken || null;
        } catch (error) {
            if (IS_DEV) {
                console.error('[Token Refresh Failed]', error);
            }
            throw error;
        }
    }

    /**
     * Notify subscribers of successful token refresh
     */
    private onRefreshed(token: string): void {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    /**
     * Add callback to be executed after token refresh
     */
    private addRefreshSubscriber(callback: (token: string) => void): void {
        this.refreshSubscribers.push(callback);
    }

    /**
     * Handle authentication failure
     */
    private async handleAuthenticationFailure(): Promise<void> {
        storage.removeItem('token');
        storage.removeItem('refreshToken');
        storage.removeItem('user');

        // Redirect to login if on client side
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.get<T>(url, config);
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.post<T>(url, data, config);
    }

    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.put<T>(url, data, config);
    }

    public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.patch<T>(url, data, config);
    }

    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.delete<T>(url, config);
    }

    public getInstance(): AxiosInstance {
        return this.instance;
    }
}

const apiClient = new APIClient();
export default apiClient;

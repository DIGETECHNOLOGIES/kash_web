import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { AUTH_ENDPOINTS } from './apiConstants';
import { storage } from '../storage';

interface RetryConfig extends AxiosRequestConfig {
    retryCount?: number;
}

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

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request Interceptor
        this.instance.interceptors.request.use(
            async (config) => {
                const token = storage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const config = error.config as RetryConfig;

                if (error.response?.status === 401 && !config.url?.includes(AUTH_ENDPOINTS.LOGIN)) {
                    if (!this.isRefreshingToken) {
                        this.isRefreshingToken = true;
                        try {
                            const newToken = await this.refreshToken();
                            this.isRefreshingToken = false;
                            this.onRefreshed(newToken);
                            return this.instance.request(config);
                        } catch (refreshError) {
                            this.isRefreshingToken = false;
                            storage.removeItem('token');
                            storage.removeItem('refreshToken');
                            if (typeof window !== 'undefined') {
                                window.location.href = '/login';
                            }
                            return Promise.reject(refreshError);
                        }
                    } else {
                        return new Promise((resolve) => {
                            this.addRefreshSubscriber((token: string) => {
                                config.headers.Authorization = `Bearer ${token}`;
                                resolve(this.instance.request(config));
                            });
                        });
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private async refreshToken(): Promise<string> {
        const refreshTokenValue = storage.getItem('refreshToken');
        if (!refreshTokenValue) throw new Error('No refresh token');

        const response = await axios.post(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.TOKEN_REFRESH}`, {
            refresh: refreshTokenValue,
        });

        const { access } = response.data;
        storage.setItem('token', access);
        return access;
    }

    private onRefreshed(token: string): void {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    private addRefreshSubscriber(callback: (token: string) => void): void {
        this.refreshSubscribers.push(callback);
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
}

const apiClient = new APIClient();
export default apiClient;

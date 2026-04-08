/**
 * API Error Handler Utility
 * Standardized error parsing and user-friendly error messages
 */

import { AxiosError } from 'axios';
import { ERROR_MESSAGES, HTTP_STATUS } from './apiConstants';

export interface APIError {
    status: number;
    message: string;
    userMessage: string;
    details?: any;
    field?: string;
    isNetworkError: boolean;
    isValidationError: boolean;
    isAuthenticationError: boolean;
}

/**
 * Parse API error response into standardized error object
 */
export const parseAPIError = (error: AxiosError): APIError => {
    const status = error.response?.status || 0;
    const data = error.response?.data as any;

    // Network errors
    if (!error.response) {
        return {
            status: 0,
            message: error.message || 'Network Error',
            userMessage: ERROR_MESSAGES.NETWORK_ERROR,
            isNetworkError: true,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
        return {
            status: 0,
            message: 'Request Timeout',
            userMessage: ERROR_MESSAGES.TIMEOUT_ERROR,
            isNetworkError: true,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Authentication errors
    if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
        const backendDetail = data?.detail || data?.error || null;
        return {
            status,
            message: backendDetail || 'Unauthorized',
            userMessage: backendDetail || getAuthErrorMessage(data),
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: true,
        };
    }

    // Validation errors (400 with field errors)
    if (status === HTTP_STATUS.BAD_REQUEST && isValidationErrorResponse(data)) {
        const validationMessage = parseValidationError(data);
        return {
            status,
            message: validationMessage || ERROR_MESSAGES.VALIDATION_ERROR,
            userMessage: validationMessage || ERROR_MESSAGES.VALIDATION_ERROR,
            details: data,
            isNetworkError: false,
            isValidationError: true,
            isAuthenticationError: false,
        };
    }

    // Not found errors
    if (status === HTTP_STATUS.NOT_FOUND) {
        return {
            status,
            message: data?.detail || 'Not Found',
            userMessage: data?.detail || ERROR_MESSAGES.NOT_FOUND,
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Rate limiting
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        return {
            status,
            message: 'Rate Limited',
            userMessage: 'Too many requests. Please try again later',
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Server errors
    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        return {
            status,
            message: data?.detail || 'Server Error',
            userMessage: ERROR_MESSAGES.SERVER_ERROR,
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Generic error with message
    if (data?.detail) {
        return {
            status,
            message: data.detail,
            userMessage: data.detail,
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Generic error with error field
    if (data?.error) {
        return {
            status,
            message: data.error,
            userMessage: data.error,
            isNetworkError: false,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    // Fallback
    return {
        status,
        message: error.message || 'Unknown Error',
        userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
        isNetworkError: false,
        isValidationError: false,
        isAuthenticationError: false,
    };
};

/**
 * Flatten DRF error response into a readable string
 */
function parseValidationError(data: any): string {
    if (!data || typeof data !== 'object') return '';

    const messages: string[] = [];

    // Handle non_field_errors first (top-level errors with no field)
    if (Array.isArray(data.non_field_errors)) {
        messages.push(...data.non_field_errors);
    }

    // Handle top-level 'detail' (common in DRF)
    if (typeof data.detail === 'string') {
        messages.push(data.detail);
    }

    // Handle top-level 'error' string (some custom endpoints use this)
    if (typeof data.error === 'string') {
        messages.push(data.error);
    }

    Object.keys(data).forEach((key) => {
        if (key === 'non_field_errors' || key === 'detail' || key === 'error') return;
        const value = data[key];
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        if (Array.isArray(value)) {
            messages.push(`${fieldName}: ${value.join(', ')}`);
        } else if (typeof value === 'object' && value !== null) {
            // Handle nested errors (should be rare)
            const nested = parseValidationError(value);
            if (nested) messages.push(`${fieldName}: ${nested}`);
        } else if (typeof value === 'string') {
            messages.push(`${fieldName}: ${value}`);
        }
    });

    return messages.join('. ');
}

/**
 * Check if error response is validation error
 */
function isValidationErrorResponse(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    // Check if it has field-level errors
    const keys = Object.keys(data);
    return keys.some(
        (key) =>
            Array.isArray(data[key]) ||
            (typeof data[key] === 'string' && key !== 'detail' && key !== 'error')
    );
}

/**
 * Get user-friendly authentication error message
 */
function getAuthErrorMessage(data: any): string {
    if (!data) return ERROR_MESSAGES.UNAUTHORIZED;

    const detail = data.detail?.toLowerCase() || '';

    if (detail.includes('invalid') || detail.includes('incorrect')) {
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }

    if (detail.includes('verify') || detail.includes('verified')) {
        return ERROR_MESSAGES.EMAIL_NOT_VERIFIED;
    }

    if (detail.includes('expired') || detail.includes('invalid token')) {
        return ERROR_MESSAGES.TOKEN_EXPIRED;
    }

    return data.detail || ERROR_MESSAGES.UNAUTHORIZED;
}

/**
 * Get field-specific error message for validation errors
 */
export const getFieldError = (error: APIError, field: string): string | null => {
    if (!error.isValidationError || !error.details) {
        return null;
    }

    const fieldErrors = error.details[field];

    if (Array.isArray(fieldErrors)) {
        return fieldErrors[0] || null;
    }

    if (typeof fieldErrors === 'string') {
        return fieldErrors;
    }

    return null;
};

/**
 * Check if error is due to specific issue
 */
export const isErrorType = (error: APIError, errorType: keyof typeof ERROR_MESSAGES): boolean => {
    return error.userMessage === ERROR_MESSAGES[errorType];
};

/**
 * Log error for debugging
 */
export const logAPIError = (error: APIError, context?: string): void => {
    if (process.env.NODE_ENV !== 'development') return;

    console.group(`[API Error] ${context || 'Unknown Context'}`);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('User Message:', error.userMessage);
    if (error.details) console.error('Details:', error.details);
    console.error('Type:', {
        isNetworkError: error.isNetworkError,
        isValidationError: error.isValidationError,
        isAuthenticationError: error.isAuthenticationError,
    });
    console.groupEnd();
};

/**
 * Handle API error and return appropriate response
 */
export const handleAPIError = (error: any, context?: string): APIError => {
    let apiError: APIError;

    if (error instanceof AxiosError) {
        apiError = parseAPIError(error);
    } else if (error instanceof Error) {
        apiError = {
            status: 0,
            message: error.message,
            userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
            isNetworkError: true,
            isValidationError: false,
            isAuthenticationError: false,
        };
    } else {
        apiError = {
            status: 0,
            message: 'Unknown error',
            userMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
            isNetworkError: true,
            isValidationError: false,
            isAuthenticationError: false,
        };
    }

    logAPIError(apiError, context);
    return apiError;
};

/**
 * Retry request based on error type
 */
export const shouldRetryRequest = (error: APIError): boolean => {
    // Don't retry validation errors
    if (error.isValidationError) return false;

    // Don't retry authentication errors
    if (error.isAuthenticationError) return false;

    // Retry network errors
    if (error.isNetworkError) return true;

    // Retry server errors (5xx)
    if (error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return true;

    // Retry rate limiting
    if (error.status === HTTP_STATUS.TOO_MANY_REQUESTS) return true;

    return false;
};

/**
 * Get HTTP status code description
 */
export const getStatusDescription = (status: number): string => {
    const descriptions: Record<number, string> = {
        [HTTP_STATUS.OK]: 'OK',
        [HTTP_STATUS.CREATED]: 'Created',
        [HTTP_STATUS.ACCEPTED]: 'Accepted',
        [HTTP_STATUS.NO_CONTENT]: 'No Content',
        [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
        [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
        [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
        [HTTP_STATUS.NOT_FOUND]: 'Not Found',
        [HTTP_STATUS.CONFLICT]: 'Conflict',
        [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
        [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
        [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
        [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
        [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout',
    };

    return descriptions[status] || 'Unknown Status';
};

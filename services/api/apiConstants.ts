/**
 * API Constants - Centralized API endpoints and configuration
 */

// Base paths
export const API_PATHS = {
    AUTH: '/api/auth',
    USERS: '/api/users',
    SHOP: '/api/shop',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    MESSAGING: '/api/messaging',
    WALLET: '/api/wallet',
    PAYMENT: '/api/payment',
} as const;

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_PATHS.AUTH}/token/`,
    TOKEN_REFRESH: `${API_PATHS.AUTH}/token/refresh/`,
    TOKEN_VERIFY: `${API_PATHS.AUTH}/token/verify/`,
    REGISTER: `${API_PATHS.USERS}/register/`,
    VERIFY_OTP: `${API_PATHS.USERS}/verify-otp/`,
    RESEND_OTP: `${API_PATHS.USERS}/resend-otp/`,
    FORGOT_PASSWORD: `${API_PATHS.USERS}/forgot-password/`,
    RESET_PASSWORD: `${API_PATHS.USERS}/reset-password/`,
} as const;

/**
 * User Profile Endpoints
 */
export const USER_ENDPOINTS = {
    ME: `${API_PATHS.USERS}/me/`,
    GET_PROFILE: `${API_PATHS.USERS}/me/`,
    UPDATE_PROFILE: `${API_PATHS.USERS}/me/`,
    LIST_USERS: `${API_PATHS.USERS}/users/`,
    GET_USER_DETAIL: (id: string) => `${API_PATHS.USERS}/users/${id}/`,
    UPDATE_PUSH_TOKEN: `${API_PATHS.USERS}/me/update-push-token/`,
} as const;

/**
 * Shop Endpoints
 */
export const SHOP_ENDPOINTS = {
    LIST_SHOPS: `${API_PATHS.SHOP}/shops/`,
    CREATE_SHOP: `${API_PATHS.SHOP}/shops/`,
    GET_SHOP_DETAIL: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/`,
    UPDATE_SHOP: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/`,
    VERIFY_SHOP: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/verify/`,
} as const;

/**
 * Product Endpoints
 */
export const PRODUCT_ENDPOINTS = {
    LIST_PRODUCTS: `${API_PATHS.PRODUCTS}/products/`,
    CREATE_PRODUCT: `${API_PATHS.PRODUCTS}/products/`,
    GET_PRODUCT_DETAIL: (id: string | number) => `${API_PATHS.PRODUCTS}/products/${id}/`,
    UPDATE_PRODUCT: (id: string | number) => `${API_PATHS.PRODUCTS}/products/${id}/`,
    DELETE_PRODUCT: (id: string | number) => `${API_PATHS.PRODUCTS}/products/${id}/`,
    RESELL_PRODUCT: (id: string | number) => `${API_PATHS.PRODUCTS}/products/${id}/resell/`,
    LIST_CATEGORIES: `${API_PATHS.PRODUCTS}/categories/`,
    GET_CATEGORY_DETAIL: (id: string | number) => `${API_PATHS.PRODUCTS}/categories/${id}/`,
} as const;

/**
 * Order Endpoints
 */
export const ORDER_ENDPOINTS = {
    LIST_ORDERS: `${API_PATHS.ORDERS}/orders/`,
    SELLER_ORDERS: `${API_PATHS.ORDERS}/orders/seller_orders/`,
    CREATE_ORDER: `${API_PATHS.ORDERS}/orders/`,
    GET_ORDER_DETAIL: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/`,
    CONFIRM_DELIVERY: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/confirm_delivery/`,
    UPDATE_ORDER_STATUS: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/status/`,
    COMPLAIN_ORDER: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/complain/`,
} as const;

/**
 * Messaging Endpoints
 */
export const MESSAGING_ENDPOINTS = {
    LIST_CONVERSATIONS: `${API_PATHS.MESSAGING}/conversations/`,
    START_CONVERSATION: `${API_PATHS.MESSAGING}/conversations/start/`,
    GET_CONVERSATION_DETAIL: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/`,
    SEND_MESSAGE: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/send_message/`,
} as const;

/**
 * Wallet Endpoints
 */
export const WALLET_ENDPOINTS = {
    GET_BALANCE: `${API_PATHS.WALLET}/wallet/`,
    WITHDRAW: `${API_PATHS.WALLET}/wallet/withdraw/`,
    LIST_TRANSACTIONS: `${API_PATHS.WALLET}/wallet/transactions/`,
} as const;

/**
 * Payment Endpoints
 */
export const PAYMENT_ENDPOINTS = {
    VERIFY_PAYMENT: `${API_PATHS.PAYMENT}/verify/`,
    WEBHOOK: `${API_PATHS.PAYMENT}/webhook/`,
    INITIATE_PAYMENT: `${API_PATHS.PAYMENT}/initiate/`,
} as const;

/**
 * API Constants - Centralized API endpoints and configuration
 * Follows the API documentation structure
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
 * @docs /api/auth/
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
 * @docs /api/users/
 */
export const USER_ENDPOINTS = {
    ME: `${API_PATHS.USERS}/me/`,
    GET_PROFILE: `${API_PATHS.USERS}/me/`,
    UPDATE_PROFILE: `${API_PATHS.USERS}/me/`,
    LIST_USERS: `${API_PATHS.USERS}/users/`,
    GET_USER_DETAIL: (id: string | number) => `${API_PATHS.USERS}/users/${id}/`,
    UPDATE_PUSH_TOKEN: `${API_PATHS.USERS}/me/update-push-token/`,
} as const;

/**
 * Shop Endpoints
 * @docs /api/shop/
 */
export const SHOP_ENDPOINTS = {
    LIST_SHOPS: `${API_PATHS.SHOP}/shops/`,
    CREATE_SHOP: `${API_PATHS.SHOP}/shops/`,
    USER_SHOP: `${API_PATHS.SHOP}/my-shops/`,
    GET_SHOP_DETAIL: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/`,
    UPDATE_SHOP: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/`,
    VERIFY_SHOP: (id: string | number) => `${API_PATHS.SHOP}/shops/${id}/verify/`,
} as const;

/**
 * Product Endpoints
 * @docs /api/products/
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
 * @docs /api/orders/
 */
export const ORDER_ENDPOINTS = {
    LIST_ORDERS: `${API_PATHS.ORDERS}/orders/`,
    SELLER_ORDERS: `${API_PATHS.ORDERS}/orders/seller_orders/`,
    CREATE_ORDER: `${API_PATHS.ORDERS}/orders/`,
    GET_ORDER_DETAIL: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/`,
    CONFIRM_DELIVERY: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/confirm_delivery/`,
    UPDATE_ORDER_STATUS: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/status/`,
    COMPLAIN_ORDER: (id: string | number) => `${API_PATHS.ORDERS}/orders/${id}/complain/`,
    CREATE_INVOICE: `${API_PATHS.ORDERS}/orders/create_invoice/`,
} as const;

/**
 * Messaging Endpoints
 * @docs /api/messaging/
 */
export const MESSAGING_ENDPOINTS = {
    LIST_CONVERSATIONS: `${API_PATHS.MESSAGING}/conversations/`,
    START_CONVERSATION: `${API_PATHS.MESSAGING}/conversations/start/`,
    UNREAD_SUMMARY: `${API_PATHS.MESSAGING}/conversations/unread_summary/`,
    GET_CONVERSATION_DETAIL: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/`,
    SEND_MESSAGE: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/send_message/`,
    EDIT_MESSAGE: (conversationId: string | number, messageId: string | number) => `${API_PATHS.MESSAGING}/conversations/${conversationId}/messages/${messageId}/edit/`,
    DELETE_MESSAGE: (conversationId: string | number, messageId: string | number) => `${API_PATHS.MESSAGING}/conversations/${conversationId}/messages/${messageId}/delete/`,
    MARK_READ: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/mark_read/`,
    START_CALL: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/start_call/`,
    SEND_CALL_SIGNAL: (id: string | number) => `${API_PATHS.MESSAGING}/conversations/${id}/send_call_signal/`,
} as const;

/**
 * Wallet Endpoints
 * @docs /api/wallet/
 */
export const WALLET_ENDPOINTS = {
    GET_BALANCE: `${API_PATHS.WALLET}/wallet/me/`,
    WITHDRAW: `${API_PATHS.WALLET}/wallet/withdraw/`,
    LIST_TRANSACTIONS: `${API_PATHS.WALLET}/wallet/transactions/`,
    LIST_WITHDRAWALS: `${API_PATHS.WALLET}/wallet/list_withdrawals/`,
} as const;

/**
 * Payment Endpoints
 * @docs /api/payment/
 */
export const PAYMENT_ENDPOINTS = {
    VERIFY_PAYMENT: `${API_PATHS.PAYMENT}/verify/`,
    WEBHOOK: `${API_PATHS.PAYMENT}/webhook/`,
    INITIATE_PAYMENT: `${API_PATHS.PAYMENT}/initiate/`,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    INVALID_OTP: 'Invalid or expired OTP code',
    TOKEN_EXPIRED: 'Your session has expired. Please login again',
    UNAUTHORIZED: 'You are not authorized to perform this action',

    // Validation
    VALIDATION_ERROR: 'Please check your input and try again',
    MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

    // Shop
    SHOP_ALREADY_EXISTS: 'You already have a shop. You can only create one shop per account',
    SHOP_NOT_VERIFIED: 'You must have a verified shop to perform this action',
    SHOP_NOT_FOUND: 'Shop not found',
    INVALID_SHOP_DATA: 'Invalid shop information provided',

    // Product
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_OUT_OF_STOCK: 'This product is out of stock',
    CANNOT_RESELL_RESALE: 'Cannot resell a product that is already a resale',
    INVALID_PRODUCT_DATA: 'Invalid product information provided',

    // Order
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_QUANTITY: 'Invalid order quantity',
    DELIVERY_CODE_INVALID: 'Invalid delivery code',

    // Wallet
    INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
    WITHDRAWAL_AMOUNT_TOO_SMALL: 'Withdrawal amount is too small',
    WITHDRAWAL_AMOUNT_TOO_LARGE: 'Withdrawal amount exceeds your available balance',

    // Payment
    PAYMENT_FAILED: 'Payment failed. Please try again',
    PAYMENT_CANCELLED: 'Payment was cancelled',
    INVALID_TRANSACTION: 'Invalid transaction ID',

    // Network
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection',
    TIMEOUT_ERROR: 'Request timeout. Please try again',
    SERVER_ERROR: 'Server error. Please try again later',
    SERVICE_UNAVAILABLE: 'Service is currently unavailable. Please try again later',

    // General
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'You do not have permission to access this resource',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    // Authentication
    LOGIN_SUCCESS: 'Logged in successfully',
    REGISTER_SUCCESS: 'Registration successful. Please verify your email',
    OTP_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully. Please login with your new password',

    // Profile
    PROFILE_UPDATED: 'Profile updated successfully',
    PROFILE_PICTURE_UPDATED: 'Profile picture updated successfully',

    // Shop
    SHOP_CREATED: 'Shop created successfully. It will be verified within 24-48 hours',
    SHOP_UPDATED: 'Shop information updated successfully',
    SHOP_VERIFIED: 'Shop verified successfully',

    // Product
    PRODUCT_CREATED: 'Product added successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    RESALE_CREATED: 'Resale product created successfully',

    // Order
    ORDER_CREATED: 'Order placed successfully',
    DELIVERY_CONFIRMED: 'Delivery confirmed successfully',

    // Wallet
    WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully',

    // Message
    MESSAGE_SENT: 'Message sent successfully',
    CONVERSATION_STARTED: 'Conversation started successfully',
} as const;

/**
 * Request/Response Timeout Configuration (in milliseconds)
 */
export const TIMEOUT_CONFIG = {
    DEFAULT: 30000,
    SHORT: 10000,
    LONG: 60000,
    FILE_UPLOAD: 120000,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    IMAGE_QUALITY: 0.85,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1920,
} as const;

/**
 * Order Status Values
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
} as const;

/**
 * Payment Status Values
 */
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESSFUL: 'SUCCESSFUL',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
} as const;

/**
 * Shop Status Values
 */
export const SHOP_STATUS = {
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
} as const;

/**
 * Withdrawal Status Values
 */
export const WITHDRAWAL_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REJECTED: 'REJECTED',
} as const;

/**
 * Currency Configuration
 */
export const CURRENCY = {
    CODE: 'XAF',
    SYMBOL: 'FCFA',
    DECIMAL_PLACES: 2,
    THOUSANDS_SEPARATOR: ',',
} as const;

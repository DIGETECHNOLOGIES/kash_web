export const API_CONFIG = {
    // BASE_URL: 'http://localhost:8000', // Development (should be env var in production)
    BASE_URL: 'https://api.digetech.org', // Production
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
};

export const APP_CONFIG = {
    MIN_ORDER_QUANTITY: 1,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    PAGINATION_LIMIT: 20,
};

export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    PHONE_LENGTH: 9,
};

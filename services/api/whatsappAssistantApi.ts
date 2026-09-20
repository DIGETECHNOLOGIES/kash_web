import apiClient from './apiClient';
import { WHATSAPP_ASSISTANT_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

export interface WhatsAppPlan {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    currency: string;
    monthly_product_limit: number;
    monthly_product_info_limit: number;
    allow_price_update: boolean;
    allow_stock_update: boolean;
    allow_availability_update: boolean;
    allow_pdf_export: boolean;
    allow_payment_links: boolean;
    allow_advanced_automation: boolean;
    is_active: boolean;
}

export interface WhatsAppUsageSummary {
    plan_name: string;
    plan_slug: string;
    plan_price: number;
    currency: string;
    status: string;
    expires_at: string | null;
    products_created: number;
    monthly_product_limit: number;
    product_info_queries: number;
    monthly_product_info_limit: number;
    billing_period_end: string | null;
    permissions: {
        allow_price_update: boolean;
        allow_stock_update: boolean;
        allow_availability_update: boolean;
        allow_pdf_export: boolean;
        allow_payment_links: boolean;
        allow_advanced_automation: boolean;
    };
}

export interface WhatsAppAssistantStatus {
    shop_id: number;
    shop_name: string;
    is_connected: boolean;
    whatsapp_phone: string | null;
    subscription: any;
    usage: WhatsAppUsageSummary;
}

export const whatsappAssistantApi = {
    /**
     * Get all available WhatsApp subscription plans
     */
    getPlans: async (): Promise<WhatsAppPlan[]> => {
        try {
            const response = await apiClient.get<WhatsAppPlan[]>(WHATSAPP_ASSISTANT_ENDPOINTS.PLANS);
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Get WhatsApp Plans');
        }
    },

    /**
     * Get store WhatsApp Assistant connection status and usage
     */
    getStatus: async (): Promise<WhatsAppAssistantStatus> => {
        try {
            const response = await apiClient.get<WhatsAppAssistantStatus>(WHATSAPP_ASSISTANT_ENDPOINTS.STATUS);
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Get WhatsApp Status');
        }
    },

    /**
     * Get detailed usage counters
     */
    getUsage: async (): Promise<WhatsAppUsageSummary> => {
        try {
            const response = await apiClient.get<WhatsAppUsageSummary>(WHATSAPP_ASSISTANT_ENDPOINTS.USAGE);
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Get WhatsApp Usage');
        }
    },

    /**
     * Request a 6-digit WhatsApp verification code
     */
    initiateLinking: async (phoneNumber: string): Promise<{ status: string; message: string }> => {
        try {
            const response = await apiClient.post(WHATSAPP_ASSISTANT_ENDPOINTS.LINK_INITIATE, {
                phone_number: phoneNumber,
            });
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Initiate WhatsApp Linking');
        }
    },

    /**
     * Confirm 6-digit verification code and link WhatsApp number
     */
    confirmLinking: async (code: string): Promise<{ status: string; message: string }> => {
        try {
            const response = await apiClient.post(WHATSAPP_ASSISTANT_ENDPOINTS.LINK_CONFIRM, { code });
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Confirm WhatsApp Code');
        }
    },

    /**
     * Disconnect WhatsApp number from store
     */
    disconnect: async (): Promise<{ status: string; message: string }> => {
        try {
            const response = await apiClient.post(WHATSAPP_ASSISTANT_ENDPOINTS.DISCONNECT, {});
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Disconnect WhatsApp');
        }
    },

    /**
     * Create or change subscription plan (direct USSD payment or switch to Free)
     */
    createSubscription: async (
        planSlug: string,
        redirectUrl?: string,
        phoneNumber?: string,
        provider?: string
    ): Promise<{
        status: string;
        direct_pay?: boolean;
        checkout_url?: string;
        transaction_reference?: string;
        subscription_id?: number;
        amount?: number;
        message?: string;
    }> => {
        try {
            const response = await apiClient.post(WHATSAPP_ASSISTANT_ENDPOINTS.SUBSCRIBE, {
                plan_slug: planSlug,
                redirect_url: redirectUrl || (typeof window !== 'undefined' ? `${window.location.origin}/dashboard/whatsapp-assistant/callback` : undefined),
                phone_number: phoneNumber,
                provider: provider,
            });
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Subscribe to Plan');
        }
    },

    /**
     * Verify Fapshi transaction on callback/return
     */
    verifyPayment: async (transId: string): Promise<{ status: string; message: string }> => {
        try {
            const response = await apiClient.get(WHATSAPP_ASSISTANT_ENDPOINTS.VERIFY_PAYMENT(transId));
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Verify Payment');
        }
    },

    /**
     * Exchange 10-minute mobile-to-web token for user session
     */
    exchangeWebToken: async (token: string): Promise<{ access: string; refresh: string; user: any; shop_id: string }> => {
        try {
            const response = await apiClient.post(WHATSAPP_ASSISTANT_ENDPOINTS.WEB_TOKEN_EXCHANGE, { token });
            return response.data;
        } catch (error) {
            throw handleAPIError(error, 'Exchange Web Token');
        }
    },
};

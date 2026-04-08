/**
 * Payment API Service
 * Handles payment verification, initiation, and webhooks
 * 
 * @docs /api/payment/
 */

import apiClient from './apiClient';
import { PAYMENT_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

interface PaymentVerification {
    message: string;
    status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
}

interface WebhookPayload {
    transaction_id: string;
    transaction_status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
}

interface PaymentInitiation {
    transaction_id: string;
    message: string;
}

export const paymentApi = {
    /**
     * Verify payment transaction status
     */
    verifyPayment: async (transactionId: string): Promise<PaymentVerification> => {
        try {
            const response = await apiClient.post<PaymentVerification>(
                PAYMENT_ENDPOINTS.VERIFY_PAYMENT,
                { transaction_id: transactionId }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Verify Payment');
        }
    },

    /**
     * Initiate a new payment
     */
    initiatePayment: async (paymentData: {
        amount: string;
        provider: 'MTN' | 'ORANGE';
        phone_number: string;
        order_ids?: number[];
    }): Promise<PaymentInitiation> => {
        try {
            const response = await apiClient.post<PaymentInitiation>(
                PAYMENT_ENDPOINTS.INITIATE_PAYMENT,
                paymentData
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Initiate Payment');
        }
    },

    /**
     * Handle payment webhook from payment gateway
     */
    webhookHandler: async (
        webhookData: WebhookPayload
    ): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                PAYMENT_ENDPOINTS.WEBHOOK,
                webhookData
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Webhook Handler');
        }
    },

    /**
     * Get payment status by transaction ID (polling)
     */
    pollPaymentStatus: async (
        transactionId: string,
        maxAttempts: number = 30,
        interval: number = 5000
    ): Promise<PaymentVerification> => {
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const status = await paymentApi.verifyPayment(transactionId);

                if (status.status === 'SUCCESSFUL' || status.status === 'FAILED') {
                    return status;
                }

                await new Promise((resolve) => setTimeout(resolve, interval));
                attempts++;
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) throw error;
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        throw new Error('Payment verification timeout. Please check transaction manually.');
    },

    /**
     * Generate payment reference code
     */
    generatePaymentReference: (orderId: number): string => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `ORD-${orderId}-${random}-${timestamp}`;
    },

    /**
     * Format payment amount for display
     */
    formatPaymentAmount: (amount: string | number): string => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 2,
        }).format(num);
    },
};

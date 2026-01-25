
import apiClient from './apiClient';
import { PAYMENT_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

export const paymentApi = {
    verifyPayment: async (transactionId: string): Promise<any> => {
        try {
            const response = await apiClient.post<any>(PAYMENT_ENDPOINTS.VERIFY_PAYMENT, { transaction_id: transactionId });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Verify Payment');
        }
    },

    initiatePayment: async (paymentData: {
        amount: string;
        provider: 'MTN' | 'ORANGE';
        phone_number: string;
        order_id?: number;
    }): Promise<any> => {
        try {
            const response = await apiClient.post<any>(PAYMENT_ENDPOINTS.INITIATE_PAYMENT, paymentData);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Initiate Payment');
        }
    },
};


import apiClient from './apiClient';
import { WALLET_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

export interface WalletBalance {
    available_balance: string;
    pending_balance: string;
    referral_earnings: string;
    shop_earnings: string;
}

export const walletApi = {
    getBalance: async (): Promise<WalletBalance> => {
        try {
            const response = await apiClient.get<WalletBalance>(WALLET_ENDPOINTS.GET_BALANCE);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Wallet Balance');
        }
    },

    getTransactionHistory: async (): Promise<any> => {
        try {
            const response = await apiClient.get<any>(WALLET_ENDPOINTS.LIST_TRANSACTIONS);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Transaction History');
        }
    },

    requestWithdrawal: async (amount: number | string): Promise<any> => {
        try {
            const response = await apiClient.post<any>(WALLET_ENDPOINTS.WITHDRAW, { amount: String(amount) });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Request Withdrawal');
        }
    },
};

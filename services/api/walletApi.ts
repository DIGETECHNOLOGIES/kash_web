/**
 * Wallet API Service
 * Handles wallet balance queries, withdrawals, and transaction history
 * 
 * @docs /api/wallet/
 */

import apiClient from './apiClient';
import { WALLET_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Wallet } from '@/types';

interface WalletResponse {
    id: number;
    user: string;
    available_balance: string;
    pending_balance: string;
    withdrawn_amount: string;
    referral_earnings: string;
    shop_earnings: string;
    updated_at: string;
}

/**
 * Maps backend wallet response to frontend Wallet type
 */
const mapWallet = (w: WalletResponse): Wallet => ({
    userId: w.user,
    availableBalance: parseFloat(w.available_balance) || 0,
    pendingBalance: parseFloat(w.pending_balance) || 0,
    totalEarnings: (parseFloat(w.referral_earnings) || 0) + (parseFloat(w.shop_earnings) || 0),
    totalWithdrawals: parseFloat(w.withdrawn_amount) || 0,
    totalOrders: 0, // Not provided by this endpoint
    totalReferrals: 0, // Not provided by this endpoint
    referralEarnings: parseFloat(w.referral_earnings) || 0,
});

interface WithdrawalRequest {
    status: string;
    message?: string;
}

interface Transaction {
    id: number;
    type: 'CREDIT' | 'DEBIT';
    amount: string;
    balance_after: string;
    description: string;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const walletApi = {
    /**
     * Get wallet balance for authenticated user
     */
    getBalance: async (): Promise<Wallet> => {
        try {
            const response = await apiClient.get<WalletResponse>(WALLET_ENDPOINTS.GET_BALANCE);
            return mapWallet(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Wallet Balance');
        }
    },

    /**
     * Submit a withdrawal request
     */
    requestWithdrawal: async (
        amount: string,
        accountNumber: string,
        accountName: string
    ): Promise<WithdrawalRequest> => {
        try {
            const response = await apiClient.post<WithdrawalRequest>(
                WALLET_ENDPOINTS.WITHDRAW,
                {
                    amount,
                    account_number: accountNumber,
                    account_name: accountName,
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Request Withdrawal');
        }
    },

    /**
     * Get withdrawal history
     */
    listWithdrawals: async (
        page: number = 1,
        pageSize: number = 20
    ): Promise<PaginatedResponse<any>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                WALLET_ENDPOINTS.LIST_WITHDRAWALS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Withdrawals');
        }
    },

    /**
     * Get transaction history
     */
    getTransactionHistory: async (
        page: number = 1,
        pageSize: number = 20
    ): Promise<PaginatedResponse<Transaction>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Transaction>>(
                WALLET_ENDPOINTS.LIST_TRANSACTIONS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Transaction History');
        }
    },

    /**
     * Calculate withdrawal amount including charges
     */
    calculateWithdrawalCharges: (amount: number) => {
        const platformFee = amount * 0.03;
        const netPayout = amount - platformFee;
        const totalDeduction = amount;

        return {
            amount,
            platformFee,
            totalCharges: platformFee,
            totalDeduction,
            receiveAmount: netPayout,
        };
    },

    /**
     * Check if user can withdraw given amount
     */
    canWithdraw: (
        availableBalance: number,
        amount: number,
        minWithdrawalAmount: number = 100
    ) => {
        const charges = walletApi.calculateWithdrawalCharges(amount);
        const hasEnoughBalance = availableBalance >= charges.totalDeduction;
        const meetsMinimum = amount >= minWithdrawalAmount;

        return {
            canWithdraw: hasEnoughBalance && meetsMinimum,
            hasEnoughBalance,
            meetsMinimum,
            charges,
            insufficientBy: hasEnoughBalance ? 0 : charges.totalDeduction - availableBalance,
        };
    },
};

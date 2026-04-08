/**
 * Referral API Service
 * Handles referral data and invitations
 */

import apiClient from './apiClient';
import { USER_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { usersApi } from './usersApi';
import { walletApi } from './walletApi';

export interface ReferralData {
    totalEarnings: string;
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
}

export interface ReferralUser {
    id: string;
    username: string;
    email: string;
    joinDate: string;
    totalEarnings: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastOrder?: string;
}

export const referralApi = {
    /**
     * Get overall referral statistics for the current user
     */
    getReferralStats: async (): Promise<ReferralData> => {
        try {
            // Fetch wallet for earnings
            const wallet = await walletApi.getBalance();

            // Fetch current user for referral code
            const user = await usersApi.getCurrentUser();

            let totalReferrals = 0;
            try {
                const referralsList = await apiClient.get(USER_ENDPOINTS.LIST_USERS, {
                    params: { referred_by: user.id }
                });
                totalReferrals = referralsList.data.count || 0;
            } catch (e) {
                console.log('Filtering users by referred_by not supported yet');
            }

            return {
                totalEarnings: String(wallet.referralEarnings || '0.00'),
                referralCode: user.number || '',
                totalReferrals: totalReferrals,
                activeReferrals: totalReferrals,
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Get Referral Stats');
        }
    },

    /**
     * Get list of users referred by the current user
     */
    getReferrals: async (page: number = 1, pageSize: number = 20): Promise<{ count: number, results: ReferralUser[] }> => {
        try {
            const user = await usersApi.getCurrentUser();

            try {
                const response = await apiClient.get(USER_ENDPOINTS.LIST_USERS, {
                    params: { referred_by: user.id, page, page_size: pageSize }
                });

                const results: ReferralUser[] = response.data.results.map((u: any) => ({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    joinDate: u.date_joined || new Date().toISOString(),
                    totalEarnings: '0.00',
                    status: 'ACTIVE'
                }));

                return {
                    count: response.data.count,
                    results
                };
            } catch (e) {
                return { count: 0, results: [] };
            }
        } catch (error: any) {
            throw handleAPIError(error, 'Get Referrals');
        }
    }
};

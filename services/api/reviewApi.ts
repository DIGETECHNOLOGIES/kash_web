import apiClient from './apiClient';
import { handleAPIError } from './apiErrorHandler';

export interface Review {
    id: string | number;
    user: string | number;
    user_name: string;
    user_image: string | null;
    product: string | number | null;
    shop: string | number | null;
    rating: number;
    comment: string;
    created_at: string;
}

export const reviewApi = {
    listReviews: async (params: { product?: string | number, shop?: string | number, page?: number }) => {
        try {
            const response = await apiClient.get('/api/reviews/reviews/', {
                params: { ...params, page_size: 10 },
            });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Reviews');
        }
    },

    createReview: async (reviewData: { product?: string | number, shop?: string | number, rating: number, comment: string }) => {
        try {
            const response = await apiClient.post('/api/reviews/reviews/', reviewData);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Create Review');
        }
    },
};

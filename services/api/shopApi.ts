
import apiClient from './apiClient';
import { SHOP_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';

import { Shop, PaginatedResponse } from '@/types';

const mapShop = (s: any): Shop => ({
    id: String(s.id),
    name: s.name,
    slug: s.slug || String(s.id),
    description: s.description || '',
    ownerId: String(s.owner),
    ownerName: s.owner_name || 'Merchant',
    ownerPhone: s.phone_number || '',
    whatsappNumber: s.whatsapp_number || s.phone_number || '',
    location: s.location || '',
    region: s.region || '',
    image: s.shop_images || s.image,
    idFrontImage: s.id_card_front,
    idBackImage: s.id_card_back,
    ownerImage: s.owner_image,
    verified: s.is_verified || s.status === 'VERIFIED',
    createdAt: s.created_at,
    totalProducts: s.totalProducts || 0,
    rating: s.rating || 0,
    average_rating: s.average_rating,
    review_count: s.review_count,
});

export const shopApi = {
    listShops: async (page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Shop>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(SHOP_ENDPOINTS.LIST_SHOPS, {
                params: { page, page_size: pageSize },
            });
            return {
                ...response.data,
                results: response.data.results.map(mapShop),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Shops');
        }
    },

    getShop: async (slug: string | number): Promise<Shop> => {
        try {
            const response = await apiClient.get<any>(SHOP_ENDPOINTS.GET_SHOP_DETAIL(slug));
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Shop Details');
        }
    },

    searchShops: async (query: string): Promise<PaginatedResponse<Shop>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(SHOP_ENDPOINTS.LIST_SHOPS, {
                params: { search: query },
            });
            return {
                ...response.data,
                results: response.data.results.map(mapShop),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Search Shops');
        }
    },

    createShop: async (shopData: any): Promise<Shop> => {
        try {
            const formData = new FormData();
            Object.entries(shopData).forEach(([key, value]) => {
                if (value) formData.append(key, value as any);
            });

            const response = await apiClient.post<any>(SHOP_ENDPOINTS.CREATE_SHOP, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Shop');
        }
    },

    updateShop: async (shopId: string | number, shopData: any): Promise<Shop> => {
        try {
            const formData = new FormData();
            Object.entries(shopData).forEach(([key, value]) => {
                if (value) formData.append(key, value as any);
            });

            const response = await apiClient.patch<any>(SHOP_ENDPOINTS.UPDATE_SHOP(shopId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Shop');
        }
    },
};

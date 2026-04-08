/**
 * Shop API Service
 * Handles shop creation, management, and verification
 * 
 * @docs /api/shop/
 */

import apiClient from './apiClient';
import { SHOP_ENDPOINTS, PAGINATION } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Shop } from '@/types';

const mapShop = (s: any): Shop => ({
    id: String(s.id),
    name: s.name,
    description: s.description || '',
    ownerId: String(s.owner),
    ownerName: s.owner_name || 'Merchant',
    ownerPhone: s.phone_number || '',
    whatsappNumber: s.phone_number || '', // Fallback
    location: s.location || '',
    region: s.region || '',
    image: s.shop_images || s.image,
    idFrontImage: s.id_card_front,
    idBackImage: s.id_card_back,
    ownerImage: s.owner_image,
    verified: s.is_verified || s.status === 'VERIFIED',
    status: s.status,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    rating: s.rating || 0,
    average_rating: s.average_rating,
    review_count: s.review_count,
    totalProducts: s.total_products || 0,
    totalOrders: s.total_orders || 0,
    revenue: parseFloat(s.revenue) || 0,
    additional_images: s.images?.map((img: any) => img.image) || [],
});

interface CreateShopData {
    name: string;
    description: string;
    email: string;
    phone_number: string;
    address: string;
    region: string;
    id_card_front: any;
    id_card_back: any;
    shop_images?: any;
    images?: any[];
}

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const shopApi = {
    /**
     * List all shops
     */
    listShops: async (
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<Shop>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                SHOP_ENDPOINTS.LIST_SHOPS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapShop)
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Shops');
        }
    },

    /**
     * Get user's shop
     */
    userShop: async (): Promise<Shop> => {
        try {
            const response = await apiClient.get<any>(SHOP_ENDPOINTS.USER_SHOP);
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'User Shop');
        }
    },

    /**
     * Create a new shop
     */
    createShop: async (shopData: CreateShopData): Promise<Shop> => {
        try {
            const formData = new FormData();
            formData.append('name', shopData.name);
            formData.append('description', shopData.description);
            formData.append('email', shopData.email);
            formData.append('phone_number', shopData.phone_number);
            formData.append('address', shopData.address);
            formData.append('region', shopData.region);
            formData.append('id_card_front', shopData.id_card_front);
            formData.append('id_card_back', shopData.id_card_back);

            if (shopData.shop_images) {
                formData.append('shop_images', shopData.shop_images);
            }

            if (shopData.images && Array.isArray(shopData.images)) {
                shopData.images.forEach((img) => {
                    formData.append('images', img);
                });
            }

            const response = await apiClient.post<any>(
                SHOP_ENDPOINTS.CREATE_SHOP,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Shop');
        }
    },

    /**
     * Get shop details
     */
    getShopById: async (shopId: string | number): Promise<Shop> => {
        try {
            const response = await apiClient.get<any>(
                SHOP_ENDPOINTS.GET_SHOP_DETAIL(shopId)
            );
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Shop Details');
        }
    },

    /**
     * Update shop information
     */
    updateShop: async (
        shopId: string | number,
        shopData: Partial<CreateShopData>
    ): Promise<Shop> => {
        try {
            const formData = new FormData();

            Object.entries(shopData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        formData.append(key, item);
                    });
                } else if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                } else if (typeof value === 'string') {
                    formData.append(key, value);
                }
            });

            const response = await apiClient.patch<any>(
                SHOP_ENDPOINTS.UPDATE_SHOP(shopId),
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return mapShop(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Shop');
        }
    },

    /**
     * Search shops by criteria
     */
    searchShops: async (query: string): Promise<PaginatedResponse<Shop>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                SHOP_ENDPOINTS.LIST_SHOPS,
                {
                    params: { search: query },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapShop)
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Search Shops');
        }
    },
};


import apiClient from './apiClient';
import { PRODUCT_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Product } from '@/types';

const mapProduct = (p: any): Product => ({
    id: String(p.id),
    slug: p.slug || String(p.id),
    shopId: String(p.shop),
    shopSlug: p.shop_slug || String(p.shop),
    shopName: p.shop_name || 'Kash Shop',
    name: p.name,
    description: p.description || '',
    images: p.images,
    price: parseFloat(p.current_price) || 0,
    previousPrice: p.previous_price ? parseFloat(p.previous_price) : undefined,
    discount: p.previous_price ? Math.round(((parseFloat(p.previous_price) - parseFloat(p.current_price)) / parseFloat(p.previous_price)) * 100) : undefined,
    minQuantity: p.min_quantity || 1,
    quantity: p.stock_quantity || 0,
    location: p.shop_location || p.location || 'Cameroon',
    category: p.category_name || 'General',
    allowReselling: !p.is_resale,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    average_rating: p.average_rating,
    review_count: p.review_count,
});

export interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const productApi = {
    listProducts: async (filters: any = {}, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Product>> => {
        try {
            const params = { ...filters, page, page_size: pageSize };
            const response = await apiClient.get<PaginatedResponse<Product>>(PRODUCT_ENDPOINTS.LIST_PRODUCTS, { params });
            return {
                ...response.data,
                results: response.data.results.map(mapProduct),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Products');
        }
    },

    getProduct: async (slug: string | number): Promise<Product> => {
        try {
            const response = await apiClient.get<any>(PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(slug));
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Product Details');
        }
    },

    listCategories: async (): Promise<any> => {
        try {
            const response = await apiClient.get<any>(PRODUCT_ENDPOINTS.LIST_CATEGORIES);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Categories');
        }
    },

    createProduct: async (productData: any): Promise<Product> => {
        try {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (value) formData.append(key, value as any);
            });

            const response = await apiClient.post<any>(PRODUCT_ENDPOINTS.CREATE_PRODUCT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Product');
        }
    },

    updateProduct: async (productId: string | number, productData: any): Promise<Product> => {
        try {
            const formData = new FormData();
            Object.entries(productData).forEach(([key, value]) => {
                if (value) formData.append(key, value as any);
            });

            const response = await apiClient.patch<any>(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(productId), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Product');
        }
    },

    deleteProduct: async (productId: string | number): Promise<void> => {
        try {
            await apiClient.delete(PRODUCT_ENDPOINTS.DELETE_PRODUCT(productId));
        } catch (error: any) {
            throw handleAPIError(error, 'Delete Product');
        }
    }
};

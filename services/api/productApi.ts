/**
 * Product API Service
 * Handles product listing, creation, updates, deletion, and resales
 * 
 * @docs /api/products/
 */

import apiClient from './apiClient';
import { PRODUCT_ENDPOINTS, PAGINATION } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Product } from '@/types';

/**
 * Maps backend product response to frontend Product type
 */
const mapProduct = (p: any): Product => ({
    id: String(p.id),
    shopId: String(p.shop),
    shopOwnerId: String(p.shop_owner_id),
    shopName: p.shop_name || 'Kash Shop',
    name: p.name,
    description: p.description || '',
    images: p.images,
    price: parseFloat(p.current_price) || 0,
    previousPrice: p.previous_price ? parseFloat(p.previous_price) : undefined,
    discount: p.previous_price ? Math.round(((parseFloat(p.previous_price) - parseFloat(p.current_price)) / parseFloat(p.previous_price)) * 100) : undefined,
    minQuantity: p.min_quantity || 1,
    quantity: p.quantity || 0,
    location: p.shop_location || p.location || 'Cameroon',
    category: p.category_name || 'General',
    allowReselling: !p.is_resale,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    average_rating: p.average_rating,
    review_count: p.review_count,
    totalSales: p.total_sales,
    uniqueViews: p.unique_views,
    additional_images: p.additional_images,
    shop_image: p.shop_image,
});

interface Category {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

interface CreateProductData {
    name: string;
    description?: string;
    current_price: string;
    previous_price?: string;
    category: string | number;
    shop: string | number;
    location?: string;
    quantity: string | number;
    min_quantity: string | number;
    images: File[];
}

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const productApi = {
    /**
     * List all products with optional filters
     */
    listProducts: async (
        filters: {
            category?: number | string;
            shop?: number | string;
            is_resale?: boolean;
            search?: string;
            page_size?: number;
        } = {},
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<Product>> => {
        try {
            const params = {
                ...filters,
                page,
                page_size: filters.page_size || pageSize,
            };

            const response = await apiClient.get<PaginatedResponse<any>>(
                PRODUCT_ENDPOINTS.LIST_PRODUCTS,
                { params }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapProduct),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Products');
        }
    },
    /**
     * Create a new product
     */
    createProduct: async (productData: CreateProductData): Promise<Product> => {
        try {
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('description', productData.description || '');
            formData.append('current_price', String(productData.current_price));

            if (productData.previous_price) {
                formData.append('previous_price', String(productData.previous_price));
            }

            formData.append('category', String(productData.category));
            formData.append('shop', String(productData.shop));

            if (productData.location) {
                formData.append('location', productData.location);
            }
            formData.append('quantity', String(productData.quantity));
            formData.append('min_quantity', String(productData.min_quantity));

            if (Array.isArray(productData.images)) {
                productData.images.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const response = await apiClient.post<any>(
                PRODUCT_ENDPOINTS.CREATE_PRODUCT,
                formData
            );
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Product');
        }
    },

    /**
     * Get product details
     */
    getProductById: async (productId: string | number): Promise<Product> => {
        try {
            const response = await apiClient.get<any>(
                PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(productId)
            );
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Product Details');
        }
    },

    /**
     * Update product information
     */
    updateProduct: async (
        productId: string | number,
        productData: Partial<CreateProductData>
    ): Promise<Product> => {
        try {
            const formData = new FormData();

            Object.entries(productData).forEach(([key, value]) => {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (value !== undefined) {
                    formData.append(key, String(value));
                }
            });

            const response = await apiClient.patch<any>(
                PRODUCT_ENDPOINTS.UPDATE_PRODUCT(productId),
                formData
            );
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Product');
        }
    },

    /**
     * Delete a product
     */
    deleteProduct: async (productId: string | number): Promise<void> => {
        try {
            await apiClient.delete(PRODUCT_ENDPOINTS.DELETE_PRODUCT(productId));
        } catch (error: any) {
            throw handleAPIError(error, 'Delete Product');
        }
    },

    /**
     * Create a resale of an existing product
     */
    resellProduct: async (
        productId: string | number,
        resaleData: {
            current_price: string;
            previous_price?: string;
            description: string;
        }
    ): Promise<Product> => {
        try {
            const response = await apiClient.post<any>(
                PRODUCT_ENDPOINTS.RESELL_PRODUCT(productId),
                resaleData
            );
            return mapProduct(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Resell Product');
        }
    },

    /**
     * List all product categories
     */
    listCategories: async (
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<Category>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Category>>(
                PRODUCT_ENDPOINTS.LIST_CATEGORIES,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'List Categories');
        }
    },

    /**
     * Record a unique view for a product
     */
    recordView: async (productId: string | number): Promise<void> => {
        try {
            await apiClient.post(
                `${PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(productId)}record_view/`
            );
        } catch (error: any) {
            console.warn('Failed to record product view:', error);
        }
    },

    /**
     * Search products by query
     */
    searchProducts: async (query: string): Promise<PaginatedResponse<Product>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                PRODUCT_ENDPOINTS.LIST_PRODUCTS,
                {
                    params: { search: query },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapProduct),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Search Products');
        }
    },
};

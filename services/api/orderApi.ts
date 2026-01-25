
import apiClient from './apiClient';
import { ORDER_ENDPOINTS } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Order } from '@/types';

export interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

const mapOrder = (o: any): Order => ({
    ...o,
    createdAt: o.created_at || o.order_date,
    updatedAt: o.updated_at,
    totalAmount: parseFloat(o.total || o.totalAmount || '0'),
    status: o.status,
    id: o.id,
    products: o.products || [],
});

export const orderApi = {
    listOrders: async (page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Order>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Order>>(ORDER_ENDPOINTS.LIST_ORDERS, {
                params: { page, page_size: pageSize },
            });
            return {
                ...response.data,
                results: response.data.results.map(mapOrder),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Orders');
        }
    },

    createOrder: async (orderData: { product: number | string; quantity: number }): Promise<Order> => {
        try {
            const response = await apiClient.post<Order>(ORDER_ENDPOINTS.CREATE_ORDER, orderData);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Create Order');
        }
    },

    getOrderById: async (orderId: string | number): Promise<Order> => {
        try {
            const response = await apiClient.get<Order>(ORDER_ENDPOINTS.GET_ORDER_DETAIL(orderId));
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Order Details');
        }
    },

    confirmDelivery: async (orderId: string | number, code: string): Promise<{ status: string }> => {
        try {
            const response = await apiClient.post<{ status: string }>(ORDER_ENDPOINTS.CONFIRM_DELIVERY(orderId), { code });
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Confirm Delivery');
        }
    },

    getSellerOrders: async (): Promise<PaginatedResponse<Order>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<Order>>(ORDER_ENDPOINTS.SELLER_ORDERS);
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Get Seller Orders');
        }
    },
};

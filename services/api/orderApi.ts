/**
 * Order API Service
 * Handles order creation, retrieval, and delivery confirmation
 * 
 * @docs /api/orders/
 */

import apiClient from './apiClient';
import { ORDER_ENDPOINTS, PAGINATION } from './apiConstants';
import { handleAPIError } from './apiErrorHandler';
import { Order } from '@/types';

/**
 * Maps backend order response to frontend Order type
 */
const toStringOrEmpty = (value: any): string =>
    value === null || value === undefined ? '' : String(value);

const toNumber = (value: any, fallback: number = 0): number => {
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : fallback;
};

const mapOrder = (o: any): Order => ({
    id: toStringOrEmpty(o.id),
    order_code: o.order_code,
    delivery_code: o.delivery_code,
    buyerId: toStringOrEmpty(o.buyer ?? o.buyer_id),
    buyer: o.buyer_name || toStringOrEmpty(o.buyer),
    sellerId: toStringOrEmpty(o.seller ?? o.seller_id),
    seller: o.seller_name || toStringOrEmpty(o.seller),
    shopId: toStringOrEmpty(o.shop_id ?? o.shop ?? o.product?.shop?.id),
    shopName: o.shop_name || 'Kash Shop',
    product_name: o.product_name,
    product_image: o.product_image,
    quantity: o.quantity,
    total: String(o.total),
    totalAmount: toNumber(o.product_total, Math.max(toNumber(o.total, 0) - toNumber(o.processing_fee, 0), 0)),
    productTotal: toNumber(o.product_total, Math.max(toNumber(o.total, 0) - toNumber(o.processing_fee, 0), 0)),
    payableTotal: toNumber(o.payable_total, toNumber(o.total, 0)),
    order_date: o.order_date,
    status: o.status,
    shipping_fee: parseFloat(o.shipping_fee) || 0,
    deliveryLocation: o.delivery_location,
    shopAmount: parseFloat(o.shop_amount) || 0,
    is_complained: o.is_complained,
    complaint_reason: o.complaint_reason,
    is_invoice: o.is_invoice,
    payment_status: o.payment_status,
    createdAt: o.created_at || o.order_date,
});

interface CreateOrderData {
    product: number;
    quantity: number;
    delivery_location?: string;
}

interface ConfirmDeliveryData {
    code: string;
}

interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export const orderApi = {
    /**
     * List authenticated user's orders
     */
    listOrders: async (
        page: number = PAGINATION.DEFAULT_PAGE,
        pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE
    ): Promise<PaginatedResponse<Order>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                ORDER_ENDPOINTS.LIST_ORDERS,
                {
                    params: { page, page_size: pageSize },
                }
            );
            return {
                ...response.data,
                results: response.data.results.map(mapOrder),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'List Orders');
        }
    },

    /**
     * Create a new order
     */
    createOrder: async (orderData: CreateOrderData): Promise<Order> => {
        try {
            const response = await apiClient.post<any>(
                ORDER_ENDPOINTS.CREATE_ORDER,
                orderData
            );
            return mapOrder(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Order');
        }
    },

    /**
     * Get order details
     */
    getOrderById: async (orderId: string | number): Promise<Order> => {
        try {
            const response = await apiClient.get<any>(
                ORDER_ENDPOINTS.GET_ORDER_DETAIL(orderId)
            );
            return mapOrder(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Get Order Details');
        }
    },

    /**
     * Confirm delivery with delivery code
     */
    confirmDelivery: async (
        orderId: string | number,
        deliveryData: ConfirmDeliveryData
    ): Promise<{ status: string }> => {
        try {
            const response = await apiClient.post<{ status: string }>(
                ORDER_ENDPOINTS.CONFIRM_DELIVERY(orderId),
                deliveryData
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Confirm Delivery');
        }
    },

    /**
     * Update order status
     */
    updateOrderStatus: async (
        orderId: string | number,
        status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    ): Promise<Order> => {
        try {
            const response = await apiClient.patch<any>(
                ORDER_ENDPOINTS.UPDATE_ORDER_STATUS(orderId),
                { status }
            );
            return mapOrder(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Update Order Status');
        }
    },

    /**
     * Get user orders (alias for listOrders)
     */
    getUserOrders: async (): Promise<PaginatedResponse<Order>> => {
        return orderApi.listOrders();
    },

    getBuyerOrders: async (): Promise<PaginatedResponse<Order>> => {
        return orderApi.listOrders();
    },

    /**
     * Get seller orders (where user is the seller)
     */
    getSellerOrders: async (): Promise<PaginatedResponse<Order>> => {
        try {
            const response = await apiClient.get<PaginatedResponse<any>>(
                ORDER_ENDPOINTS.SELLER_ORDERS
            );
            return {
                ...response.data,
                results: response.data.results.map(mapOrder),
            };
        } catch (error: any) {
            throw handleAPIError(error, 'Get Seller Orders');
        }
    },

    /**
     * Submit a complaint about an order
     */
    complain: async (
        orderId: string | number,
        reason: string
    ): Promise<{ status: string }> => {
        try {
            const response = await apiClient.post<{ status: string }>(
                ORDER_ENDPOINTS.COMPLAIN_ORDER(orderId),
                { reason }
            );
            return response.data;
        } catch (error: any) {
            throw handleAPIError(error, 'Submit Complaint');
        }
    },

    /**
     * Create an invoice for a customer
     */
    createInvoice: async (data: {
        product_id: string | number;
        buyer_identifier: string;
        quantity: number;
        total?: number;
        delivery_location?: string;
    }): Promise<Order> => {
        try {
            const response = await apiClient.post<any>(
                ORDER_ENDPOINTS.CREATE_INVOICE,
                data
            );
            return mapOrder(response.data);
        } catch (error: any) {
            throw handleAPIError(error, 'Create Invoice');
        }
    },
};

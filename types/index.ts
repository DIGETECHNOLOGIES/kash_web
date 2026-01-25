export interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

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

export interface User {
    id: string;
    email: string;
    username: string;
    number: string;
    location?: string;
    role: 'buyer' | 'seller' | 'reseller';
    profileImage?: string;
    createdAt: string;
    referralCode: string;
    referredBy?: string;
    has_shop?: boolean;
}

export interface Shop {
    id: string;
    name: string;
    slug: string;
    description: string;
    ownerId: string;
    ownerName: string;
    ownerPhone: string;
    whatsappNumber: string;
    location: string;
    region: string;
    image?: string;
    idFrontImage: string;
    idBackImage: string;
    ownerImage: string;
    verified: boolean;
    createdAt: string;
    totalProducts: number;
    rating: number;
    average_rating?: number;
    review_count?: number;
}

export interface Product {
    id: string;
    slug: string;
    shopId: string;
    shopSlug: string;
    shopName: string;
    name: string;
    description: string;
    images: string;
    price: number;
    previousPrice?: number;
    discount?: number;
    minQuantity: number;
    quantity: number;
    location: string;
    category: string;
    allowReselling: boolean;
    createdAt: string;
    updatedAt: string;
    average_rating?: number;
    review_count?: number;
}

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    shopId: string;
}

export interface Order {
    id: string | number;
    order_code?: string;
    delivery_code?: string;
    buyerId?: string;
    buyer?: string;
    sellerId?: string;
    resellerId?: string;
    shopId?: string;
    shopName: string;
    product_name?: string;
    product_image?: string;
    quantity?: number;
    products: OrderProduct[];
    totalAmount: number;
    total?: string | number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus?: string;
    paymentMethod?: string;
    payment_status?: string;
    payment_method?: string;
    payment_number?: string;
    createdAt: string;
    updatedAt?: string;
    deliveryLocation?: string;
    is_complained?: boolean;
    complaint_reason?: string;
}

export interface OrderProduct {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    senderType: 'user' | 'shop';
    receiverType: 'user' | 'shop';
    content: string;
    read: boolean;
    createdAt: string;
}

export interface Wallet {
    userId: string;
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalWithdrawals: number;
    totalOrders: number;
    totalReferrals: number;
    referralEarnings: number;
}

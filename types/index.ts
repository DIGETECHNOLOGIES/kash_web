
export interface User {
    id: string;
    email: string;
    username: string;
    number: string;
    role: 'buyer' | 'seller' | 'reseller';
    location?: string;
    image?: string;
    profile_image?: string;
    createdAt: string;
    referralCode: string;
    referredBy?: string;
    has_shop?: boolean;
    date_joined?: string;
    first_name?: string;
    last_name?: string;
}

export interface Shop {
    id: string;
    name: string;
    owner?: string | number;
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
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
    createdAt: string;
    updatedAt?: string;
    totalProducts: number;
    rating: number;
    average_rating?: number;
    review_count?: number;
    description?: string;
    totalOrders?: number;
    revenue?: number;
    additional_images?: string[];
}

export interface Product {
    id: string;
    shopId: string;
    shopOwnerId: string;
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
    totalSales?: number;
    uniqueViews?: number;
    revenue?: number;
    additional_images?: { id: number; image: string }[] | string[];
    shop_image?: string;
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
    buyer?: any;
    sellerId?: string;
    seller?: any;
    resellerId?: string;
    shopId?: string;
    shopName: string;
    product_name?: string;
    product_image?: string;
    quantity?: number;
    products?: OrderProduct[];
    totalAmount?: number;
    productTotal?: number;
    payableTotal?: number;
    total?: string | number;
    order_date?: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    payment_status?: string;
    payment_method?: string;
    payment_number?: string;
    createdAt: string;
    updatedAt?: string;
    shipping_fee?: number;
    deliveryLocation?: string;
    shopAmount?: number;
    is_complained?: boolean;
    complaint_reason?: string;
    is_invoice?: boolean;
}

export interface OrderProduct {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
}

export interface Category {
    id: string | number;
    name: string;
    slug?: string;
    image?: string;
    product_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Message {
    id: string;
    conversation?: string | number;
    sender?: string | number;
    senderId: string;
    receiverId: string;
    senderType: 'user' | 'shop';
    receiverType: 'user' | 'shop';
    content: string;
    read: boolean;
    createdAt: string;
    image?: string;
    is_system?: boolean;
}

export interface Conversation {
    id: string | number;
    participant1: any;
    participant2: any;
    last_message: Message;
    unread_count: number;
    updated_at: string;
}

export interface Wallet {
    userId: string;
    availableBalance: number;
    available_balance?: number;
    pendingBalance: number;
    pending_balance?: number;
    totalEarnings: number;
    totalWithdrawals: number;
    totalOrders: number;
    totalReferrals: number;
    referralEarnings: number;
}

export interface Transaction {
    id: string | number;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    status: string;
    createdAt: string;
}

export interface Withdrawal {
    id: string | number;
    amount: number;
    status: string;
    method: string;
    account_number: string;
    account_name: string;
    created_at: string;
}

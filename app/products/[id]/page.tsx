import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailsClient } from './ProductDetailsClient';
import { API_CONFIG } from '@/constants/config';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function fetchProductData(id: string) {
    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/products/products/${id}/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
            id: String(data.id),
            shopId: String(data.shop),
            shopOwnerId: String(data.shop_owner_id),
            shopName: data.shop_name || 'Kash Shop',
            name: data.name,
            description: data.description || '',
            images: data.images,
            price: parseFloat(data.current_price) || 0,
            previousPrice: data.previous_price ? parseFloat(data.previous_price) : undefined,
            discount: data.previous_price ? Math.round(((parseFloat(data.previous_price) - parseFloat(data.current_price)) / parseFloat(data.previous_price)) * 100) : undefined,
            minQuantity: data.min_quantity || 1,
            quantity: data.quantity || 0,
            location: data.shop_location || data.location || 'Cameroon',
            category: data.category_name || 'General',
            allowReselling: !data.is_resale,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            average_rating: data.average_rating,
            review_count: data.review_count,
            totalSales: data.total_sales,
            uniqueViews: data.unique_views,
            additional_images: data.additional_images,
            shop_image: data.shop_image,
        };
    } catch (e) {
        console.error('SSR fetch product error:', e);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductData(id);

    if (!product) {
        return {
            title: 'Product Not Found - KASH Marketplace',
            description: 'The requested product could not be found on KASH Marketplace.',
        };
    }

    const title = `${product.name} | ${formatCurrency(product.price)} - KASH Marketplace`;
    const description = (product.description || '').slice(0, 160) || `Buy ${product.name} on KASH Marketplace for ${formatCurrency(product.price)}. Secure escrow payment with fast delivery in Cameroon.`;
    const fullImageUrl = formatImageUrl(product.images);
    const productPageUrl = `https://kash.digetech.org/products/${product.id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: productPageUrl,
            siteName: 'KASH Marketplace',
            images: [
                {
                    url: fullImageUrl,
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
            type: 'website',
            locale: 'en_CM',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [fullImageUrl],
        },
    };
}

export default async function ProductDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const product = await fetchProductData(id);

    if (!product) {
        notFound();
    }

    return <ProductDetailsClient product={product as any} />;
}

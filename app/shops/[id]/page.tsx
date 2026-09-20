import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopDetailsClient } from './ShopDetailsClient';
import { API_CONFIG } from '@/constants/config';
import { formatImageUrl } from '@/utils/formatters';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function fetchShopData(id: string) {
    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/shop/shops/${id}/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const s = await res.json();
        return {
            id: String(s.id),
            ownerId: String(s.owner),
            name: s.name,
            description: s.description || '',
            ownerName: s.owner_name || '',
            ownerPhone: s.phone_number || '',
            location: s.address || s.location || '',
            region: s.region || '',
            image: s.shop_images || s.image || '',
            verified: s.is_verified || s.status === 'VERIFIED',
            status: s.status,
            createdAt: s.created_at,
            rating: s.rating || 0,
            average_rating: s.average_rating,
            review_count: s.review_count,
            totalProducts: s.total_products || 0,
            totalOrders: s.total_orders || 0,
            revenue: parseFloat(s.revenue) || 0,
        };
    } catch (e) {
        console.error('SSR fetch shop error:', e);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const shop = await fetchShopData(id);

    if (!shop) {
        return {
            title: 'Shop Not Found - KASH Marketplace',
            description: 'The requested shop could not be found on KASH Marketplace.',
        };
    }

    const title = `${shop.name} | Verified Shop - KASH Marketplace`;
    const description = (shop.description || '').slice(0, 160) || `Shop online at ${shop.name} on KASH Marketplace. Verified seller with secure escrow payments in ${shop.location || 'Cameroon'}.`;
    const fullImageUrl = formatImageUrl(shop.image);
    const shopPageUrl = `https://kash.digetech.org/shops/${shop.id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: shopPageUrl,
            siteName: 'KASH Marketplace',
            images: [
                {
                    url: fullImageUrl,
                    width: 800,
                    height: 800,
                    alt: shop.name,
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

export default async function ShopDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const shop = await fetchShopData(id);

    if (!shop) {
        notFound();
    }

    return <ShopDetailsClient shop={shop} />;
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaymentLinkClient } from './PaymentLinkClient';
import { API_CONFIG } from '@/constants/config';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';

interface PageProps {
    params: Promise<{ code: string }>;
}

async function fetchPaymentLinkData(code: string) {
    try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/orders/payment-links/${code}/`, {
            next: { revalidate: 30 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('SSR fetch payment link error:', e);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { code } = await params;
    const link = await fetchPaymentLinkData(code);

    if (!link) {
        return {
            title: 'Payment Link - KASH Marketplace',
            description: 'Secure payment request on KASH Marketplace.',
        };
    }

    const title = `Pay for ${link.product_name} | ${formatCurrency(link.total)} - KASH`;
    const description = `Direct purchase link from ${link.shop_name} for ${link.quantity}x ${link.product_name}. Escrow protected payment with instant confirmation.`;
    const fullImageUrl = formatImageUrl(link.product_image);
    const linkUrl = `https://kash.digetech.org/pay/${code}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: linkUrl,
            siteName: 'KASH Marketplace',
            images: [
                {
                    url: fullImageUrl,
                    width: 800,
                    height: 800,
                    alt: link.product_name,
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

export default async function PaymentLinkPage({ params }: PageProps) {
    const { code } = await params;
    const link = await fetchPaymentLinkData(code);

    if (!link) {
        notFound();
    }

    return <PaymentLinkClient code={code} initialData={link} />;
}

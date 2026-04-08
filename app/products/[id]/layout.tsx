import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.digetech.org/api';

async function getProduct(id: string) {
    try {
        const res = await fetch(`${API_BASE}/products/products/${id}/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function resolveImageUrl(input: any): string {
    const fallback = 'https://kash.digetech.org/logo.png';

    const resolveInput = (value: any): string | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string') return value.trim();
        if (Array.isArray(value)) {
            const firstString = value.find((item) => typeof item === 'string' && item.trim());
            return typeof firstString === 'string' ? firstString.trim() : undefined;
        }
        if (typeof value === 'object') {
            if (typeof value.uri === 'string') return value.uri.trim();
            if (typeof value.url === 'string') return value.url.trim();
        }
        return undefined;
    };

    const url = resolveInput(input);
    if (!url) return fallback;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/media/')) return `https://api.digetech.org${url}`;
    return `https://eu2.contabostorage.com/9c9ad2677b6747cdb1d33e49a634f65e:kashdev/${url}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Product | KASH Marketplace',
            description: 'Discover products on KASH Marketplace',
        };
    }

    const imageUrl = resolveImageUrl(product.images);
    const price = Number(product.current_price || product.price || 0).toLocaleString();
    const prevPrice = product.previous_price || product.previousPrice;
    const discountText = prevPrice ? ` (Discounted from ${Number(prevPrice).toLocaleString()} FCFA)` : '';

    const title = `${product.name} — ${price} FCFA | KASH`;
    const description = `${product.name}${discountText}. ${product.description ? product.description.slice(0, 120) : 'Buy on KASH Marketplace. Secure payments & fast delivery across Cameroon.'}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://kash.digetech.org/products/${id}`,
            siteName: 'KASH Marketplace',
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
            locale: 'en_CM',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

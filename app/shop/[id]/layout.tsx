import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.digetech.org/api';

async function getShop(id: string) {
  try {
    const res = await fetch(`${API_BASE}/shop/shops/${id}/`, {
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
      if (typeof firstString === 'string') return firstString.trim();

      const firstObject = value.find((item) => item && typeof item === 'object');
      if (firstObject) return resolveInput(firstObject);
      return undefined;
    }
    if (typeof value === 'object') {
      if (typeof value.uri === 'string') return value.uri.trim();
      if (typeof value.url === 'string') return value.url.trim();
      if (typeof value.image === 'string') return value.image.trim();
      if (typeof value.src === 'string') return value.src.trim();
      if (typeof value.path === 'string') return value.path.trim();
      if (typeof value.file === 'string') return value.file.trim();
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
  const shop = await getShop(id);

  if (!shop) {
    return {
      title: 'Shop | KASH Marketplace',
      description: 'Discover verified shops on KASH Marketplace',
    };
  }

  const rawImage = shop.shop_images || shop.image || shop.shop_image;
  const imageUrl = resolveImageUrl(rawImage);

  const title = `${shop.name} | KASH Shop`;
  const description = shop.description
    ? String(shop.description).slice(0, 140)
    : 'Visit this shop on KASH Marketplace. Secure payments & fast delivery across Cameroon.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://kash.digetech.org/shop/${id}`,
      siteName: 'KASH Marketplace',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: shop.name,
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

export default function ShopAliasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

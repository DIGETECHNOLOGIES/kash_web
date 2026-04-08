import { toast } from 'sonner';

import { formatCurrency } from '@/utils/formatters';

const ORIGIN_FALLBACK = 'https://kash.digetech.org';

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (origin.endsWith('kash.digetech.org')) return origin;
  }
  return ORIGIN_FALLBACK;
}

export function getProductShareUrl(productId: string | number): string {
  return `${getOrigin()}/products/${productId}`;
}

export function getShopShareUrl(shopId: string | number): string {
  return `${getOrigin()}/shops/${shopId}`;
}

export function buildProductShareText(product: {
  id: string | number;
  name: string;
  price: number;
  previousPrice?: number | null;
  location?: string | null;
  description?: string | null;
}): string {
  const url = getProductShareUrl(product.id);
  const description = (product.description || '').trim();
  const descriptionShort = description ? description.slice(0, 120) : '';
  const location = product.location || 'Cameroon';
  const prev = product.previousPrice ? ` (was ${formatCurrency(product.previousPrice)})` : '';

  return `🔥 *${product.name}*\n\n💰 Price: ${formatCurrency(product.price)}${prev}\n\n📍 ${location}\n\n📝 ${descriptionShort}\n\n👉 View on KASH: ${url}\n\n✨ Shop securely on KASH Marketplace!`;
}

export function buildShopShareText(shop: {
  id: string | number;
  name: string;
  location?: string | null;
  region?: string | null;
}): string {
  const url = getShopShareUrl(shop.id);
  const location = shop.location || '';
  const region = shop.region || '';

  return `🏪 *${shop.name}*\n\n📍 ${location}${region ? `, ${region}` : ''}\n\n✨ Verified seller on KASH Marketplace with secure escrow payments.\n\n👉 View shop on KASH: ${url}`;
}

export async function shareOrCopy(payload: {
  title?: string;
  text: string;
  url?: string;
  copiedToast?: string;
}): Promise<void> {
  const { title, text, url, copiedToast } = payload;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(copiedToast || 'Details copied!');
  } catch {
    toast.error('Sharing not supported on this browser');
  }
}

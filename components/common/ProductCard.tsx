'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Share2, Store, Star, MapPin } from 'lucide-react';
import { Product } from '@/types';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onPress?: (product: Product) => void;
    width?: string;
}

export function ProductCard({ product, onAddToCart, onPress, width = '100%' }: ProductCardProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { addItem } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onAddToCart) {
            onAddToCart(product);
        } else {
            addItem(product);
            toast.success(t('product.addedToCart') || 'Added to cart');
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.origin + `/products/${product.id}`,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.origin + `/products/${product.id}`);
            toast.info('Link copied to clipboard');
        }
    };

    return (
        <Card
            className="group relative overflow-hidden p-0 h-full flex flex-col bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg"
            style={{ width }}
            hoverable
            onClick={() => router.push(`/products/${product.id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-background dark:bg-background-dark">
                <img
                    src={formatImageUrl(product.images)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Share Button - Top Left (matches mobile) */}
                <button
                    className="absolute left-2 top-2 rounded-full bg-white/90 p-1.5 text-black shadow-sm transition-colors hover:bg-white z-10"
                    onClick={handleShare}
                >
                    <Share2 size={16} />
                </button>

                {/* Discount Badge - Top Right (matches mobile) */}
                {product.discount && product.discount > 0 && (
                    <div className="absolute right-2 top-2 rounded bg-error px-2 py-1 text-[10px] font-bold text-white z-10">
                        -{product.discount}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3">
                {/* Name */}
                <h3 className="mb-1 line-clamp-1 text-base font-black text-text dark:text-text-dark group-hover:text-primary transition-colors italic uppercase tracking-tighter">
                    {product.name}
                </h3>

                {/* Shop Info */}
                <div className="mb-1 flex items-center gap-1.5 text-text-secondary dark:text-text-secondary-dark font-bold">
                    <Store size={14} className="text-primary" />
                    <span className="text-[12px] line-clamp-1 truncate uppercase tracking-tight">{product.shopName}</span>
                </div>

                {/* Location */}
                <div className="mb-1 flex items-center gap-1.5 text-text-secondary dark:text-text-secondary-dark font-bold">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-[12px] line-clamp-1 truncate uppercase tracking-tight">{product.location || 'Cameroon'}</span>
                </div>

                {/* Rating */}
                <div className="mb-2 flex items-center gap-1 font-black text-text-secondary dark:text-text-secondary-dark italic">
                    <Star size={14} className="text-warning fill-warning" />
                    <span className="text-[11px]">
                        {product.average_rating?.toFixed(1) || '0.0'} ({product.review_count || 0})
                    </span>
                </div>

                {/* Price and Add Button */}
                <div className="mt-auto flex items-end justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <span className="text-base font-black text-primary truncate italic">
                            {formatCurrency(product.price)}
                        </span>
                        {product.previousPrice && (
                            <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark line-through truncate opacity-70">
                                {formatCurrency(product.previousPrice)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95 shrink-0 shadow-md"
                    >
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </Card>
    );
}

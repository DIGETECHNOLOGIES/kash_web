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
import { buildProductShareText, getProductShareUrl, shareOrCopy } from '@/utils/share';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onPress?: (product: Product) => void;
    width?: string;
    isOwnerMode?: boolean;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onPress, width = '100%', isOwnerMode, onEdit, onDelete }: ProductCardProps) {
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
        const deepLink = getProductShareUrl(product.id);
        const shareText = buildProductShareText({
            id: product.id,
            name: product.name,
            price: product.price,
            previousPrice: (product as any).previousPrice,
            location: product.location,
            description: product.description,
        });

        void shareOrCopy({
            title: product.name,
            text: shareText,
            url: deepLink,
            copiedToast: t('common.linkCopied') || 'Link & details copied!',
        });
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
                        <span className="text-base font-black text-primary truncate italic">{formatCurrency(product.price)}</span>
                        {product.previousPrice && (
                            <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark line-through truncate opacity-70">
                                {formatCurrency(product.previousPrice)}
                            </span>
                        )}
                    </div>

                    {isOwnerMode ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary/20 shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete?.(product); }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error transition-all hover:bg-error/20 shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-95 shrink-0 shadow-md"
                        >
                            <ShoppingCart size={18} />
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}


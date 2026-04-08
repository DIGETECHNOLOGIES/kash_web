'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Package, Star, ShieldCheck, Share2 } from 'lucide-react';
import { Shop } from '@/types';
import { Card } from './Card';
import { useTranslation } from 'react-i18next';
import { formatImageUrl } from '@/utils/formatters';
import { buildShopShareText, getShopShareUrl, shareOrCopy } from '@/utils/share';

interface ShopCardProps {
    shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
    const { t } = useTranslation();

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const url = getShopShareUrl(shop.id);
        const shareText = buildShopShareText({
            id: shop.id,
            name: shop.name,
            location: shop.location,
            region: shop.region,
        });

        void shareOrCopy({
            title: shop.name,
            text: shareText,
            url,
            copiedToast: t('common.linkCopied') || 'Shop details copied!',
        });
    };

    return (
        <Card className="mb-4 overflow-hidden bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-3" hoverable>
            <Link href={`/shops/${shop.id}`} className="flex gap-4">
                {/* Image/Avatar */}
                <div className="h-20 w-20 rounded-2xl bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {shop.image ? (
                        <img
                            src={formatImageUrl(shop.image)}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-black text-primary italic uppercase">{shop.name.charAt(0)}</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-lg font-black text-text dark:text-text-dark truncate leading-tight group-hover:text-primary transition-colors italic uppercase tracking-tighter">
                                {shop.name}
                            </h3>
                            {shop.verified && (
                                <ShieldCheck size={18} className="text-primary shrink-0" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-text-secondary dark:text-text-secondary-dark font-bold">
                            <MapPin size={14} className="shrink-0 text-primary" />
                            <span className="text-[13px] truncate uppercase tracking-tight">
                                {shop.region ? `${shop.region}, ` : ''}{shop.location}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary dark:text-text-secondary-dark font-bold">
                            <Package size={14} className="shrink-0 text-primary" />
                            <span className="text-[13px] truncate uppercase tracking-tight">
                                {shop.totalProducts || 0} {t('shop.totalProducts') || 'Products'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-sm font-black text-text dark:text-text-dark italic">
                            <Star size={14} className="fill-warning text-warning" />
                            <span>
                                {shop.average_rating?.toFixed(1) || '0.0'} ({shop.review_count || 0})
                            </span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="p-1.5 hover:bg-primary/10 rounded-full transition-colors group/share"
                        >
                            <Share2 size={20} className="text-primary group-hover/share:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </Link>
        </Card>
    );
}


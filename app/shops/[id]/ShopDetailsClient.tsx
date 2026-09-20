'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '@/services/api/productApi';
import { messagingApi } from '@/services/api/messagingApi';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Store, MapPin, ShieldCheck, MessageCircle, Share2, Star, Calendar, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatImageUrl } from '@/utils/formatters';
import { toast } from 'sonner';
import { buildShopShareText, getShopShareUrl, shareOrCopy } from '@/utils/share';
import { ReviewSection } from '@/components/common/ReviewSection';

interface ShopDetailsClientProps {
    shop: any;
}

const WhatsAppIcon = ({ size = 20, className }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.3" />
    </svg>
);

export function ShopDetailsClient({ shop }: ShopDetailsClientProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop-products', shop?.id],
        queryFn: () => productApi.listProducts({ shop: shop?.id }),
        enabled: !!shop?.id,
    });

    const { isAuthenticated } = useAuthStore();

    const handleContact = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/shops/${shop.id}`);
            return;
        }
        try {
            const convo = await messagingApi.startConversation(String(shop?.id), 'BUYER', true);
            router.push(`/messages?convo=${convo.id}`);
        } catch (error) {
            console.error('Failed to start conversation', error);
            toast.error('Could not start conversation');
        }
    };

    const handleShare = () => {
        if (!shop) return;
        const deepLink = getShopShareUrl(shop.id);
        const shareText = buildShopShareText({
            id: shop.id,
            name: shop.name,
            location: shop.location,
            region: shop.region,
        });

        void shareOrCopy({
            title: shop.name,
            text: shareText,
            url: deepLink,
            copiedToast: t('common.linkCopied') || 'Shop link & details copied!',
        });
    };

    const products = productsData?.results || [];

    return (
        <MainLayout>
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
                <ChevronLeft size={20} /> {t('common.back')}
            </button>

            {/* Shop Header Banner */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-surface border border-border p-8 lg:p-12 mb-12">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="h-32 w-32 rounded-3xl overflow-hidden bg-background border-2 border-border shadow-2xl flex-shrink-0">
                        <img
                            src={formatImageUrl(shop.image)}
                            alt={shop.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{shop.name}</h1>
                            {shop.verified && (
                                <Badge variant="primary" className="rounded-xl px-3 py-1 flex items-center gap-1">
                                    <ShieldCheck size={14} /> {t('settings.verifiedSellerBadge')}
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} className="text-primary" />
                                <span>{shop.location || shop.address || 'Cameroon'}{shop.region ? `, ${shop.region}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star size={16} className="text-warning fill-warning" />
                                <span className="font-bold text-foreground">{shop.rating?.toFixed(1) || '0.0'}</span>
                                <span>({shop.totalOrders || 0} {t('settings.sales')})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                <span>{t('settings.joined')} {new Date(shop.createdAt).getFullYear()}</span>
                            </div>
                        </div>

                        <p className="text-text-secondary max-w-2xl text-sm lg:text-base leading-relaxed">
                            {shop.description || t('shop.noDescription')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                            {shop.ownerPhone && (
                                <a
                                    href={`https://wa.me/${(() => {
                                        const clean = String(shop.ownerPhone).replace(/[^0-9]/g, '');
                                        return clean.startsWith('237') ? clean : `237${clean}`;
                                    })()}?text=${encodeURIComponent(`Hello ${shop.name}, I found your shop on KASH Marketplace and would like to inquire about your products.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-colors"
                                >
                                    <WhatsAppIcon size={18} />
                                    WhatsApp
                                </a>
                            )}
                            <Button className="rounded-xl h-11 px-6 gap-2" onClick={handleContact}>
                                <MessageCircle size={18} />
                                {t('settings.contactShop')}
                            </Button>
                            <Button variant="outline" className="rounded-xl h-11 px-6 gap-2" onClick={handleShare}>
                                <Share2 size={18} />
                                {t('common.share')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Products Section */}
            <div className="space-y-8 mb-24">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{t('settings.storeProducts')}</h2>
                        <p className="text-text-secondary text-sm">{products.length} {t('product.productsAvailable')}</p>
                    </div>
                </div>

                {isLoadingProducts ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-surface rounded-3xl border border-border">
                        <Store size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
                        <h3 className="text-lg font-bold mb-1">{t('shop.noProducts')}</h3>
                        <p className="text-text-secondary text-sm">{t('shop.noProductsDesc')}</p>
                    </div>
                )}
            </div>

            {/* Shop Reviews Section */}
            <section className="border-t border-border pt-24 mb-24">
                <ReviewSection shopId={shop.id} />
            </section>
        </MainLayout>
    );
}

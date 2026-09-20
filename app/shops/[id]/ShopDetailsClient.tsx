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

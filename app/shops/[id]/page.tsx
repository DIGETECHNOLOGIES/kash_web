'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { shopApi } from '@/services/api/shopApi';
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

import { ReviewSection } from '@/components/common/ReviewSection';

export default function ShopDetailsPage() {
    const { id: slug } = useParams();
    const router = useRouter();
    const { t } = useTranslation();

    const { data: shop, isLoading: isLoadingShop } = useQuery({
        queryKey: ['shop', slug],
        queryFn: () => shopApi.getShopById(slug as string),
    });

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop-products', slug],
        queryFn: () => productApi.listProducts({ shop: shop?.id }),
        enabled: !!shop?.id,
    });

    const { isAuthenticated } = useAuthStore();

    const handleContact = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/shops/${slug}`);
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

    if (isLoadingShop) {
        return (
            <MainLayout>
                <div className="animate-pulse">
                    <div className="h-48 rounded-[3rem] bg-surface mb-12" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface rounded-2xl" />)}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
                <ChevronLeft size={20} /> {t('common.back')}
            </button>

            {/* Shop Header */}
            <section className="relative mb-12">
                <div className="h-48 md:h-64 rounded-[3rem] bg-secondary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary opacity-60" />
                    <div className="absolute top-6 right-6 flex gap-3">
                        <Button variant="outline" className="rounded-2xl border-white/20 text-white bg-white/10 backdrop-blur-md">
                            <Share2 size={18} className="mr-2" /> {t('common.share')}
                        </Button>
                    </div>
                </div>

                <div className="px-6 md:px-12 -translate-y-12">
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                        <div className="h-32 w-32 md:h-48 md:w-48 rounded-[2.5rem] bg-surface border-8 border-background shadow-2xl flex items-center justify-center text-primary relative overflow-hidden shrink-0">
                            {shop?.image ? (
                                <img src={formatImageUrl(shop.image)} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-5xl md:text-8xl font-black italic uppercase text-primary leading-none">
                                        {shop?.name?.charAt(0) || 'K'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{shop?.name}</h1>
                                {shop?.verified && <ShieldCheck size={32} className="text-primary" />}
                            </div>
                            <div className="flex flex-wrap gap-6 text-base font-black italic uppercase tracking-widest text-text-secondary">
                                <span className="flex items-center gap-2"><MapPin size={20} className="text-primary" /> {shop?.location}, {shop?.region}</span>
                                <span className="flex items-center gap-2"><Calendar size={20} className="text-primary" /> {t('settings.joinedOnShop', { year: shop?.createdAt ? new Date(shop.createdAt).getFullYear() : '2024' })}</span>
                                <span className="flex items-center gap-2 text-warning"><Star size={20} className="fill-warning" /> {shop?.average_rating?.toFixed(1) || '0.0'} ({shop?.review_count || 0} {t('settings.reviews')})</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto mb-2">
                            <Button size="lg" className="w-full md:w-auto h-16 px-10 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase italic tracking-widest text-lg" onClick={handleContact}>
                                <MessageCircle size={24} className="mr-2" /> {t('settings.chat')}
                            </Button>
                        </div>
                    </div>

                    <Card className="p-10 rounded-[3rem] border-none bg-surface/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 italic flex items-center gap-2">
                            <Store size={16} className="text-primary" /> {t('settings.aboutMerchant')}
                        </h3>
                        <p className="text-text-secondary leading-relaxed max-w-4xl text-lg font-medium italic">
                            {shop?.description || t('settings.defaultShopDescription', { name: shop?.name, region: shop?.region })}
                        </p>
                    </Card>
                </div>
            </section>

            {/* Shop Products */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t('settings.merchantCatalog')}</h2>
                    <Badge variant="outline" className="px-4 py-1.5 rounded-xl uppercase font-black italic">{productsData?.count || 0} {t('home.products')}</Badge>
                </div>

                {isLoadingProducts ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface border border-border" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {productsData?.results?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Shop Reviews */}
            <section className="mt-24 border-t border-border pt-24 mb-24">
                <ReviewSection shopId={shop?.id} />
            </section>
        </MainLayout>
    );
}

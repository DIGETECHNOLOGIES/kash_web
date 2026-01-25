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

import { ReviewSection } from '@/components/common/ReviewSection';

export default function ShopDetailsPage() {
    const { id: slug } = useParams();
    const router = useRouter();
    const { t } = useTranslation();

    const { data: shop, isLoading: isLoadingShop } = useQuery({
        queryKey: ['shop', slug],
        queryFn: () => shopApi.getShop(slug as string),
    });

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop-products', slug],
        queryFn: () => productApi.listProducts({ shop: shop?.id }),
        enabled: !!shop?.id,
    });

    const { isAuthenticated } = useAuthStore();

    const handleContact = async () => {
        if (!isAuthenticated) {
            router.push(`/auth/login?redirect=/shops/${slug}`);
            return;
        }
        try {
            const convo = await messagingApi.startConversation({
                shop_slug: slug as string,
                role: 'BUYER'
            });
            router.push(`/messages?convo=${convo.id}`);
        } catch (error) {
            console.error('Failed to start conversation', error);
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
                            <Share2 size={18} className="mr-2" /> Share
                        </Button>
                    </div>
                </div>

                <div className="px-6 md:px-12 -translate-y-12">
                    <div className="flex flex-col md:flex-row items-end gap-6 mb-6">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-surface border-8 border-background shadow-2xl flex items-center justify-center text-primary relative overflow-hidden">
                            <Store size={64} />
                        </div>
                        <div className="flex-1 mb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{shop?.name}</h1>
                                {shop?.verified && <ShieldCheck size={24} className="text-primary" />}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-text-secondary">
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary" /> {shop?.location}, {shop?.region}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary" /> Joined {shop?.createdAt ? new Date(shop.createdAt).getFullYear() : '2024'}</span>
                                <span className="flex items-center gap-1.5 text-warning"><Star size={16} className="fill-warning" /> {shop?.average_rating?.toFixed(1) || '0.0'} ({shop?.review_count || 0} reviews)</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto mb-2">
                            <Button size="lg" className="w-full md:w-auto h-14 px-8 rounded-2xl shadow-xl shadow-primary/20" onClick={handleContact}>
                                <MessageCircle size={20} className="mr-2" /> Contact Merchant
                            </Button>
                        </div>
                    </div>

                    <Card className="p-8 rounded-[2.5rem] border-border/40 bg-surface/50 backdrop-blur-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-3 italic">About the Merchant</h3>
                        <p className="text-text-secondary leading-relaxed max-w-3xl">
                            {shop?.description || `Welcome to ${shop?.name}. We are verified merchants on KASH specializing in high-quality products with a focus on customer satisfaction and reliable delivery across ${shop?.region}.`}
                        </p>
                    </Card>
                </div>
            </section>

            {/* Shop Products */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">Merchant <span className="text-primary underline decoration-primary/30">Catalog</span></h2>
                    <Badge variant="outline" className="px-4 py-1.5 rounded-xl uppercase font-black italic">{productsData?.count || 0} Products</Badge>
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

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Share2, MapPin, Store, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Minus, Plus, MessageCircle, Info, Star } from 'lucide-react';
import { productApi } from '@/services/api/productApi';
import { messagingApi } from '@/services/api/messagingApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

import { ReviewSection } from '@/components/common/ReviewSection';

export default function ProductDetailsPage() {
    const { id: slug } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => productApi.getProductById(slug as string),
    });

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/products/${slug}`);
            return;
        }
        if (product) {
            addItem(product, quantity);
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/products/${slug}`);
            return;
        }
        if (product) {
            router.push(`/buy/${slug}`);
        }
    };

    const handleContactMerchant = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/products/${slug}`);
            return;
        }
        if (!product) return;
        try {
            // Initiate a user_shop conversation using shopId
            const convo = await messagingApi.startConversation(String(product.shopId), 'BUYER', true);
            router.push(`/messages?convo=${convo.id}`);
        } catch (error) {
            console.error('Failed to contact merchant', error);
            toast.error('Could not start conversation');
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
                    <div className="w-full lg:w-1/2 aspect-square bg-surface rounded-3xl" />
                    <div className="flex-1 space-y-6">
                        <div className="h-4 w-24 bg-surface rounded" />
                        <div className="h-12 w-3/4 bg-surface rounded" />
                        <div className="h-6 w-1/3 bg-surface rounded" />
                        <div className="h-32 w-full bg-surface rounded" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!product) {
        return (
            <MainLayout>
                <div className="text-center py-24">
                    <h1 className="text-2xl font-bold">Product not found</h1>
                    <Button onClick={() => router.back()} variant="ghost" className="mt-4">
                        Go Back
                    </Button>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Product Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-surface border border-border group"
                >
                    <img
                        src={formatImageUrl(product.images)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 right-6 flex flex-col gap-3">
                        <button className="rounded-full bg-white/90 p-3 text-text-secondary shadow-lg backdrop-blur-md transition-colors hover:text-error dark:bg-black/50">
                            <Heart size={20} />
                        </button>
                        <button className="rounded-full bg-white/90 p-3 text-text-secondary shadow-lg backdrop-blur-md transition-colors hover:text-primary dark:bg-black/50">
                            <Share2 size={20} />
                        </button>
                    </div>
                    {product.discount && (
                        <Badge variant="error" className="absolute top-6 left-6 text-sm px-4 py-1.5 shadow-lg">
                            -{product.discount}% OFF
                        </Badge>
                    )}
                </motion.div>

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full"
                >
                    <div className="mb-2 flex items-center gap-3">
                        <Badge variant="primary" className="rounded-lg">{product.category}</Badge>
                        {product.quantity > 0 ? (
                            <Badge variant="success" className="rounded-lg">{t('product.inStock')}</Badge>
                        ) : (
                            <Badge variant="error" className="rounded-lg">{t('product.outOfStock')}</Badge>
                        )}
                    </div>

                    <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1 text-warning">
                            <Star size={20} className="fill-warning" />
                            <span className="text-lg font-black">{product.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-sm font-bold text-text-secondary">({product.review_count || 0} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-surface border border-border">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Store size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary leading-none mb-1">Sold by</p>
                                <Link href={`/shops/${product.shopId}`} className="text-sm font-bold hover:text-primary transition-colors">
                                    {product.shopName}
                                </Link>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl h-10 gap-2" onClick={handleContactMerchant}>
                            <MessageCircle size={16} />
                            Chat
                        </Button>
                    </div>

                    <div className="flex items-baseline gap-4 mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                        <span className="text-4xl font-black text-primary italic">
                            {formatCurrency(product.price)}
                        </span>
                        {product.previousPrice && (
                            <span className="text-lg text-text-secondary line-through font-medium">
                                {formatCurrency(product.previousPrice)}
                            </span>
                        )}
                    </div>

                    <div className="space-y-6 mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3 ml-1">
                                {t('product.description')}
                            </h3>
                            <p className="text-text-secondary leading-relaxed text-sm lg:text-base">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 border-y border-border py-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                <MapPin size={16} className="text-primary" />
                                {product.location}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                <ShieldCheck size={16} className="text-primary" />
                                Verified Seller
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                <Truck size={16} className="text-primary" />
                                Next Day Delivery
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mt-auto">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-2xl border border-border overflow-hidden bg-background h-14">
                                <button
                                    onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                                    className="px-4 hover:bg-surface transition-colors disabled:opacity-30"
                                    disabled={quantity <= product.minQuantity}
                                >
                                    <Minus size={18} />
                                </button>
                                <div className="w-12 text-center font-black text-lg">{quantity}</div>
                                <button
                                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                    className="px-4 hover:bg-surface transition-colors disabled:opacity-30"
                                    disabled={quantity >= product.quantity}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <p className="text-xs font-bold text-text-secondary italic">
                                {product.minQuantity} unit min.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                            <Button
                                size="lg"
                                className="rounded-[1.25rem] h-16 text-md font-black shadow-lg shadow-primary/20"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                here {t('product.addToCart')}
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="rounded-[1.25rem] h-16 text-md font-black italic shadow-lg"
                                onClick={handleBuyNow}
                            >
                                {t('product.buyNow')}
                            </Button>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" size="lg" className="flex-1 rounded-[1.25rem] h-14 text-sm font-bold" onClick={handleContactMerchant}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {t('shop.messageShop')}
                            </Button>
                            {product.allowReselling && (
                                <Button variant="outline" size="lg" className="flex-1 rounded-[1.25rem] h-14 text-sm font-bold border-dashed border-primary/50 text-primary hover:bg-primary/5">
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    {t('product.resell')}
                                </Button>
                            )}
                        </div>

                        <div className="pt-8 border-t border-border mt-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                                <Info size={16} />
                                About Merchant
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4 italic">
                                {product.shopName} has been a verified merchant on KASH since {new Date(product.createdAt).getFullYear()}.
                                They are known for high quality {product.category.toLowerCase()} and fast delivery.
                            </p>
                            <div className="flex gap-4">
                                <Button variant="ghost" size="sm" className="text-xs text-text-secondary hover:text-error h-8 px-0" onClick={() => router.push(`/report?type=product&id=${product.id}`)}>
                                    Report Item
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs text-text-secondary hover:text-primary h-8 px-0" onClick={() => router.push(`/help`)}>
                                    Request Help
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Trust Badges */}
            <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="flex items-center gap-6 p-8 rounded-[2rem]">
                    <div className="h-16 w-16 min-w-[4rem] rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg mb-1">Purchase Protection</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">Your money is safe with KASH Escrow until you confirm delivery.</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 p-8 rounded-[2rem]">
                    <div className="h-16 w-16 min-w-[4rem] rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Truck size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg mb-1">Insured Shipping</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">Damaged or lost items are fully covered by our logistics partners.</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-6 p-8 rounded-[2rem]">
                    <div className="h-16 w-16 min-w-[4rem] rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <RefreshCcw size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg mb-1">Easy Exchanges</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">Return items within 48h if they don&apos;t match the description.</p>
                    </div>
                </Card>
            </section>

            {/* Reviews Section */}
            <section className="mt-24 border-t border-border pt-24 mb-24">
                <ReviewSection productId={product.id} />
            </section>
        </MainLayout>
    );
}

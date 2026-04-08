'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';

export default function CartPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { items, updateQuantity, removeItem, getTotal } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const subtotal = getTotal();
    const total = subtotal;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/cart');
            return;
        }
        router.push('/checkout');
    };

    return (
        <MainLayout>
            <div className="mb-12">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                    <ShoppingCart size={40} className="text-primary" />
                    {t('cart.basket')}
                </h1>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-24 bg-surface rounded-[3rem] border border-dashed border-border">
                    <div className="bg-background h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 text-text-secondary">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-2xl font-black italic uppercase mb-2">{t('cart.empty')}</h2>
                    <p className="text-text-secondary mb-8">{t('cart.looksLikeEmpty')}</p>
                    <Link href="/products">
                        <Button size="lg" className="rounded-2xl px-12">
                            {t('cart.continueShopping')}
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Items List */}
                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <Card className="p-4 md:p-6 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-24 w-24 min-w-[6rem] rounded-2xl bg-background overflow-hidden">
                                            <img src={formatImageUrl(item.product.images)} alt={item.product.name} className="h-full w-full object-cover" />
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                                                {item.product.shopName}
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1">{item.product.name}</h3>
                                            <div className="text-primary font-black italic text-xl">
                                                {formatCurrency(item.product.price)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center rounded-2xl border border-border bg-background overflow-hidden h-12">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="px-3 hover:bg-surface transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="px-3 hover:bg-surface transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="p-3 rounded-2xl text-error hover:bg-error/10 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Checkout Summary */}
                    <aside className="w-full lg:w-96">
                        <Card className="p-8 rounded-[2.5rem] bg-secondary text-white sticky top-24 shadow-2xl border-none">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">
                                {t('cart.summary')}
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="font-black italic uppercase text-lg">{t('cart.total')}</span>
                                    <span className="text-2xl font-black text-primary italic">
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                            </div>

                            <Button size="lg" className="w-full rounded-2xl h-14 text-md font-black group" onClick={handleCheckout}>
                                {t('cart.checkoutNow')}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                    <ShieldCheck size={16} className="text-primary" />
                                    {t('cart.securedByEscrow')}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                    <Truck size={16} className="text-primary" />
                                    {t('cart.expressDelivery')}
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            )}
        </MainLayout>
    );
}

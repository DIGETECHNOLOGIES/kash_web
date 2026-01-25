'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '@/services/api/productApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Smartphone, CreditCard, Truck, ShieldCheck, MapPin, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function BuyPage() {
    const { id: slug } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'om' | 'card'>('momo');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => productApi.getProduct(slug as string),
    });

    const handlePurchase = async () => {
        // Logic to initiate payment and create order
        alert('Payment initiated. Please check your phone for the push notification.');
        router.push('/orders');
    };

    if (isLoading) return <MainLayout><div>Loading...</div></MainLayout>;
    if (!product) return <MainLayout><div>Product not found</div></MainLayout>;

    return (
        <MainLayout>
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
                <ChevronLeft size={20} /> Back to Product
            </button>

            <div className="max-w-5xl mx-auto py-8">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-12">
                    Complete <span className="text-primary underline decoration-primary/30">Purchase</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Delivery Address */}
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Delivery Details</h2>
                            <Card className="p-6 rounded-3xl bg-surface border-border/60">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">Standard Delivery</h3>
                                        <p className="text-sm text-text-secondary mb-4 italic">Estimated arrival: 24 - 48 hours</p>
                                        <input
                                            type="text"
                                            placeholder="Enter your precise delivery address..."
                                            className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm font-bold focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Payment Method</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setPaymentMethod('momo')}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'momo' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-surface opacity-60'}`}
                                >
                                    <Smartphone size={32} className={paymentMethod === 'momo' ? 'text-primary' : ''} />
                                    <span className="font-black italic text-xs uppercase">MTN MoMo</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('om')}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'om' ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10' : 'border-border bg-surface opacity-60'}`}
                                >
                                    <Smartphone size={32} className={paymentMethod === 'om' ? 'text-orange-500' : ''} />
                                    <span className="font-black italic text-xs uppercase">Orange Money</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-surface opacity-60'}`}
                                >
                                    <CreditCard size={32} className={paymentMethod === 'card' ? 'text-primary' : ''} />
                                    <span className="font-black italic text-xs uppercase">Visa/MasterCard</span>
                                </button>
                            </div>

                            <Card className="mt-4 p-6 rounded-3xl bg-surface border-border/60">
                                <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2 ml-1">Phone Number for payment</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. 677000000"
                                    className="w-full h-14 rounded-2xl border border-border bg-background px-6 text-lg font-black italic focus:border-primary focus:outline-none"
                                />
                            </Card>
                        </section>
                    </div>

                    {/* Order Summary */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 ml-1">Order Summary</h2>
                            <Card className="p-8 rounded-[2.5rem] bg-secondary text-white border-none shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <ShieldCheck size={80} />
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-16 w-16 rounded-2xl bg-white overflow-hidden">
                                        <img src={product.images} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black italic uppercase text-sm line-clamp-1">{product.name}</h3>
                                        <p className="text-xs text-slate-400">Sold by {product.shopName}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span className="font-bold">{product.price.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Delivery Fee</span>
                                        <span className="font-bold">1,500 FCFA</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                        <span className="text-xs font-black uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black italic">{(product.price + 1500).toLocaleString()} <small className="text-xs font-bold opacity-50">FCFA</small></span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePurchase}
                                    size="lg"
                                    className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                    Pay securely
                                </Button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                    <ShieldCheck size={14} className="text-primary" />
                                    Protected by KASH Escrow
                                </div>
                            </Card>
                        </div>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}

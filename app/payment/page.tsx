'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderApi } from '@/services/api/orderApi';
import { paymentApi } from '@/services/api/paymentApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    CreditCard,
    Smartphone,
    ShieldCheck,
    ChevronLeft,
    CheckCircle2,
    Lock,
    AlertCircle,
    ArrowRight,
    Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency, formatImageUrl } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function PaymentPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user } = useAuthStore();

    const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE' | null>(null);
    const [phone, setPhone] = useState(user?.number || '');
    const [loading, setLoading] = useState(false);

    const { data: order, isLoading: isLoadingOrder } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => orderApi.getOrderById(orderId as string),
        enabled: !!orderId,
    });

    if (!orderId) {
        if (typeof window !== 'undefined') router.push('/profile/orders');
        return null;
    }

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error(t('checkout.selectPaymentMethod'));
            return;
        }
        if (!phone) {
            toast.error(t('checkout.provideDeliveryDetails'));
            return;
        }

        setLoading(true);
        try {
            const amount = Number(order?.payableTotal || order?.total || 0);

            await paymentApi.initiatePayment({
                amount: String(amount),
                provider: paymentMethod,
                phone_number: phone,
                order_ids: [Number(orderId)]
            });

            toast.success(t('checkout.paymentRequestSent', { item: order?.product_name || 'Order' }));
            router.push('/checkout/success');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('checkout.errorProcessOrder'));
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingOrder) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto py-20 text-center uppercase italic font-black animate-pulse">
                    <Package size={48} className="mx-auto mb-4 text-primary opacity-20" />
                    Loading Order Details...
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto py-20 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-error" />
                    <h1 className="text-2xl font-black italic uppercase italic tracking-tighter">Order not found</h1>
                    <Button onClick={() => router.push('/profile/orders')} variant="ghost" className="mt-4">
                        Back to Orders
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-20">
                <header className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} /> {t('common.back')}
                    </button>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Order Payment</h1>
                    <p className="text-text-secondary font-bold uppercase italic text-xs">Complete your purchase for Order #{order.order_code || order.id}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic flex items-center gap-2">
                                <CreditCard size={18} className="text-primary" /> Select Payment Method
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'MTN', name: 'MTN Mobile Money', color: 'border-yellow-400 bg-yellow-400/5' },
                                    { id: 'ORANGE', name: 'Orange Money', color: 'border-orange-500 bg-orange-500/5' }
                                ].map((pm) => (
                                    <div
                                        key={pm.id}
                                        onClick={() => setPaymentMethod(pm.id as any)}
                                        className={cn(
                                            "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between",
                                            paymentMethod === pm.id ? `${pm.color} ring-4 ring-offset-2 ring-primary/10` : 'border-border/40 hover:border-primary/30'
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border shadow-inner">
                                                <Smartphone size={24} className="text-text-secondary" />
                                            </div>
                                            <h4 className="font-black italic uppercase italic tracking-tight">{pm.name}</h4>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            paymentMethod === pm.id ? 'border-primary bg-primary text-white' : 'border-border'
                                        )}>
                                            {paymentMethod === pm.id && <CheckCircle2 size={14} />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Payment Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="677 000 000"
                                        className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </Card>

                        <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
                            <ShieldCheck className="text-primary shrink-0" size={24} />
                            <p className="text-[10px] font-bold text-text-secondary leading-relaxed uppercase italic">
                                Secure payment via KASH Escrow. Your money is only released after you confirm delivery.
                            </p>
                        </div>

                        <Button
                            onClick={handlePayment}
                            isLoading={loading}
                            className="w-full h-20 rounded-[2rem] text-lg font-black uppercase italic shadow-2xl shadow-primary/30 group bg-primary"
                        >
                            Pay {formatCurrency(Number(order.payableTotal || order.total || 0))}
                            <Lock size={20} className="ml-3 group-hover:scale-110 transition-transform" />
                        </Button>
                    </div>

                    <aside className="w-full space-y-8">
                        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-secondary text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 italic relative z-10">Order Summary</h3>

                            <div className="flex gap-4 items-center relative z-10 mb-8">
                                <div className="h-16 w-16 rounded-xl bg-white/10 p-1">
                                    <img src={formatImageUrl(order.product_image)} className="h-full w-full object-cover rounded-lg" alt={order.product_name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black uppercase tracking-tight truncate">{order.product_name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Qty: {order.quantity}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-white/10 relative z-10">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Product Total</span>
                                    <span>{formatCurrency(Number(order.productTotal || order.totalAmount || 0))}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Service Fee</span>
                                    <span>{formatCurrency(Math.max(Number(order.payableTotal || 0) - Number(order.productTotal || 0), 0))}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-white/20">
                                    <span className="text-lg font-black italic uppercase tracking-tighter">Total</span>
                                    <span className="text-2xl font-black text-primary italic">{formatCurrency(Number(order.payableTotal || order.total || 0))}</span>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}

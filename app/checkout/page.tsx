'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import {
    ShieldCheck,
    MapPin,
    Truck,
    CreditCard,
    ChevronLeft,
    ArrowRight,
    Smartphone,
    CheckCircle2,
    Lock,
    Package,
    Minus,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { orderApi } from '@/services/api/orderApi';
import { paymentApi } from '@/services/api/paymentApi';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';

export default function CheckoutPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { items, getTotal, clearCart, updateQuantity } = useCartStore();
    const { user } = useAuthStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE' | null>(null);
    const [phone, setPhone] = useState(user?.number || '');
    const [location, setLocation] = useState(user?.location || '');
    const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
    const [paymentPopup, setPaymentPopup] = useState<{ message: string; transactionId?: string } | null>(null);

    const subtotal = getTotal();
    const total = subtotal;

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            toast.error(t('checkout.selectPaymentMethod'));
            return;
        }
        if (!phone || !location) {
            toast.error(t('checkout.provideDeliveryDetails'));
            return;
        }

        setLoading(true);
        try {
            // 1. Create orders for each item
            const createdOrders = [];
            for (const item of items) {
                const order = await orderApi.createOrder({
                    product: Number(item.product.id),
                    quantity: item.quantity,
                    delivery_location: location,
                });
                createdOrders.push({ ...order, itemPrice: item.product.price * item.quantity });
            }

            // 2. Initiate payment ONCE for all orders (same flow as mobile)
            const orderIds = createdOrders
                .map((o: any) => Number(o.id))
                .filter((id: number) => Number.isFinite(id));

            const payableAmount = createdOrders.reduce((sum: number, o: any) => {
                const v = Number(o.payableTotal ?? (o as any).payable_total ?? o.total ?? 0);
                return sum + (Number.isFinite(v) ? v : 0);
            }, 0);

            const res = await paymentApi.initiatePayment({
                amount: String(payableAmount),
                provider: paymentMethod,
                phone_number: phone,
                order_ids: orderIds,
            });

            setPaymentPopup({
                message: res?.message || (t('checkout.paymentRequestSent', { item: 'Order' }) as string) || 'Payment request sent. Please check your phone.',
                transactionId: res?.transaction_id,
            });
            setPaymentPopupOpen(true);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('checkout.errorProcessOrder'));
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        if (typeof window !== 'undefined') {
            router.push('/cart');
        }
        return null;
    }

    return (
        <MainLayout>
            <Modal
                isOpen={paymentPopupOpen}
                onClose={() => setPaymentPopupOpen(false)}
                title={t('checkout.paymentMethodSelection') || 'Payment Request Sent'}
                className="max-w-lg"
            >
                <div className="p-8 space-y-6">
                    <p className="text-sm font-bold leading-relaxed">{paymentPopup?.message}</p>
                    {!!paymentPopup?.transactionId && (
                        <div className="rounded-2xl border border-border bg-background p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Transaction ID</p>
                            <p className="text-xs font-bold break-all">{paymentPopup.transactionId}</p>
                        </div>
                    )}
                    <Button
                        className="w-full h-14 rounded-2xl font-black uppercase italic"
                        onClick={() => {
                            setPaymentPopupOpen(false);
                            clearCart();
                            router.push('/checkout/success');
                        }}
                    >
                        Continue
                    </Button>
                </div>
            </Modal>

            <div className="max-w-6xl mx-auto pb-20">
                <header className="mb-12">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                        className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} /> {t('common.back')}
                    </button>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">{t('checkout.title')}</h1>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-4 mt-8">
                        {[1, 2].map((i) => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-border/40'}`} />
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic flex items-center gap-2">
                                            <Truck size={18} className="text-primary" /> {t('checkout.deliveryLogistics')}
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('checkout.deliveryAddress')}</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                                    <input
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Example: Douala, Akwa - Rue de le Joie"
                                                        className="w-full h-16 rounded-[1.5rem] bg-background border-2 border-border/40 pl-14 pr-8 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('checkout.contactPhone')}</label>
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
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">{t('checkout.deliverySpeed')}</label>
                                                    <div className="h-16 rounded-[1.5rem] bg-primary/5 border-2 border-primary/20 flex items-center px-8 gap-4">
                                                        <CheckCircle2 size={24} className="text-primary" />
                                                        <div className="flex-1">
                                                            <span className="text-xs font-black italic uppercase italic">{t('checkout.priorityExpress')}</span>
                                                            <p className="text-[8px] font-bold text-text-secondary uppercase">{t('checkout.deliveryGuaranteed')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Button
                                        onClick={() => setStep(2)}
                                    >
                                        {t('checkout.proceedToPayment')} <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <Card className="p-8 md:p-10 rounded-[3rem] border-none shadow-2xl">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-8 italic flex items-center gap-2">
                                            <CreditCard size={18} className="text-primary" /> {t('checkout.paymentMethodSelection')}
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { id: 'MTN', name: 'MTN Mobile Money', icon: '/icons/mtn.png', color: 'border-yellow-400 bg-yellow-400/5' },
                                                { id: 'ORANGE', name: 'Orange Money', icon: '/icons/orange.png', color: 'border-orange-500 bg-orange-500/5' }
                                            ].map((pm) => (
                                                <div
                                                    key={pm.id}
                                                    onClick={() => setPaymentMethod(pm.id as any)}
                                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === pm.id ? `${pm.color} ring-4 ring-offset-2 ring-primary/10` : 'border-border/40 hover:border-primary/30'}`}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={`h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border shadow-inner`}>
                                                            <Smartphone size={24} className="text-text-secondary" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black italic uppercase italic tracking-tight">{pm.name}</h4>
                                                        </div>
                                                    </div>
                                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === pm.id ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                                                        {paymentMethod === pm.id && <CheckCircle2 size={14} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
                                        <ShieldCheck className="text-primary shrink-0" size={24} />
                                        <p className="text-[10px] font-bold text-text-secondary leading-relaxed uppercase italic">
                                            {t('cart.securedByEscrow')}.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handlePlaceOrder}
                                        isLoading={loading}
                                        className="w-full h-20 rounded-[2rem] text-lg font-black uppercase italic shadow-2xl shadow-primary/30 group bg-primary"
                                    >
                                        {t('checkout.confirmAndPay')}
                                        <Lock size={20} className="ml-3 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Order Summary */}
                    <aside className="w-full space-y-8">
                        <Card className="p-8 rounded-[3rem] border-none shadow-2xl bg-secondary text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-20" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 italic relative z-10">{t('cart.summary')}</h3>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-8 pr-2 relative z-10">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-12 w-12 rounded-xl bg-white/10 p-1">
                                            <img src={formatImageUrl(item.product.images)} className="h-full w-full object-cover rounded-lg" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[10px] font-black uppercase tracking-tight truncate">{item.product.name}</h4>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{t('product.quantity')}:</span>
                                                <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden h-7">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        className="px-2 hover:bg-white/10 transition-colors"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="px-2 hover:bg-white/10 transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black italic">{(item.product.price * item.quantity).toLocaleString()} F</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-white/10 relative z-10">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>{t('cart.subtotal')}</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-white/20">
                                    <span className="text-lg font-black italic uppercase tracking-tighter">{t('cart.total')}</span>
                                    <span className="text-2xl font-black text-primary italic">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </Card>

                        <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-surface shadow-sm border border-border/40">
                            <Badge variant="primary" className="p-1 px-3 uppercase italic font-black text-[8px]">{t('shop.verified')}</Badge>
                            <span className="text-[10px] font-bold text-text-secondary uppercase">{t('checkout.secureSsl')}</span>
                        </div>
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}

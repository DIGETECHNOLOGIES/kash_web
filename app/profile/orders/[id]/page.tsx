'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderApi } from '@/services/api/orderApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    ChevronLeft,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    ShieldCheck,
    CheckCircle2,
    Truck,
    Clock,
    MessageCircle,
    AlertCircle,
    Download,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deliveryCode, setDeliveryCode] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderApi.getOrderById(id as string),
    });

    const confirmMutation = useMutation({
        mutationFn: (code: string) => orderApi.confirmDelivery(id as string, { code }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            setIsConfirmOpen(false);
        },
    });

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return Clock;
            case 'PROCESSING': return Package;
            case 'SHIPPED': return Truck;
            case 'DELIVERED': return CheckCircle2;
            default: return Package;
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto animate-pulse uppercase italic">
                    <div className="h-8 w-48 bg-surface rounded-xl mb-12" />
                    <div className="h-64 bg-surface rounded-[3rem] mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-96 bg-surface rounded-[3rem]" />
                        <div className="h-96 bg-surface rounded-[3rem]" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="text-center py-24">
                    <AlertCircle className="mx-auto mb-4 text-error" size={64} />
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter">Order not found</h1>
                    <Button onClick={() => router.push('/profile/orders')} variant="ghost" className="mt-4">
                        Back to Orders
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const StatusIcon = getStatusIcon(order.status);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-black uppercase italic tracking-widest text-text-secondary hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} /> {t('common.back')}
                    </button>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl h-12 border-border/60 font-black uppercase italic text-xs">
                            <Download size={18} className="mr-2" /> Receipt
                        </Button>
                        <Button variant="outline" className="rounded-2xl h-12 w-12 border-border/60 p-0">
                            <MoreVertical size={20} />
                        </Button>
                    </div>
                </div>

                {/* Hero Order Header */}
                <section className="mb-8 p-10 rounded-[3rem] bg-secondary text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3" />

                    <div className="relative z-10 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                            <Badge className="bg-primary/20 text-primary-light border-none px-4 py-1.5 uppercase italic font-black text-xs">
                                Order #{order.order_code || order.id}
                            </Badge>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> {format(new Date(order.createdAt), 'MMM dd, yyyy • HH:mm')}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-2">
                            {order.status}
                        </h1>
                        <p className="text-slate-400 font-medium italic">Estimated delivery by Tomorrow, 18:00</p>
                    </div>

                    <div className="relative z-10">
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary shadow-2xl">
                            <StatusIcon size={window.innerWidth > 768 ? 64 : 48} />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Products & Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 rounded-[3rem] border-border/40 shadow-sm">
                            <h2 className="text-xl font-black italic uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                <Package size={24} className="text-primary" />
                                Items in order
                            </h2>

                            <div className="space-y-6">
                                {(order.products || []).map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-4 rounded-3xl bg-background/50 border border-border/30 group">
                                        <div className="h-20 w-20 rounded-2xl bg-surface overflow-hidden border border-border/50 shrink-0">
                                            <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-lg truncate uppercase tracking-tight italic group-hover:text-primary transition-colors">{item.productName}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs font-black uppercase text-text-secondary">Quantity: {item.quantity}</span>
                                                <span className="text-primary font-black italic text-lg">{item.totalPrice.toLocaleString()} F</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-border/40 space-y-4">
                                <div className="flex justify-between text-sm font-bold text-text-secondary uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>{Number(order.totalAmount || 0).toLocaleString()} F</span>
                                </div>

                                <div className="flex justify-between items-end pt-4 border-t border-dashed border-border/60">
                                    <span className="text-lg font-black italic uppercase tracking-tighter">Total Paid</span>
                                    <span className="text-3xl font-black text-primary italic">{(Number(order.totalAmount || 0)).toLocaleString()} <small className="text-xs not-italic opacity-60">FCFA</small></span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="space-y-8">
                        {/* Merchant Card */}
                        <Card className="p-8 rounded-[3rem] border-border/40 shadow-sm bg-gradient-to-br from-surface to-background flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner ring-1 ring-primary/20">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Official Partner</h3>
                            <h4 className="text-xl font-black italic uppercase tracking-tight mb-6">{order.shopName}</h4>
                            <Button
                                onClick={() => router.push(`/messages?shop=${order.shopId}&orderId=${order.id}`)}
                                className="w-full rounded-2xl h-14 font-black uppercase italic shadow-lg shadow-primary/10"
                            >
                                <MessageCircle size={20} className="mr-2" /> Message Seller
                            </Button>
                        </Card>

                        {/* Delivery Details */}
                        <Card className="p-8 rounded-[3rem] border-border/40 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-6 italic underline decoration-primary/30">Delivery Details</h3>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-background flex items-center justify-center text-text-secondary shadow-sm">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Destination</h5>
                                        <p className="text-sm font-black italic">{order.deliveryLocation || 'Douala, AKWA 3rd Street'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-background flex items-center justify-center text-text-secondary shadow-sm">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Payment via</h5>
                                        <p className="text-sm font-black italic">{order.paymentMethod || 'MTN Mobile Money'}</p>
                                    </div>
                                </div>
                            </div>

                            {order.payment_status?.toUpperCase() !== 'PAID' && (
                                <div className="mt-8">
                                    <Button
                                        onClick={() => router.push(`/payment?orderId=${order.id}`)}
                                        className="w-full rounded-2xl h-14 bg-success hover:bg-success/90 font-black uppercase italic shadow-xl shadow-success/20"
                                    >
                                        <CreditCard size={20} className="mr-2" /> Pay Now
                                    </Button>
                                    <p className="text-[10px] text-center text-text-secondary font-bold uppercase italic mt-4">
                                        Secure your order with KASH Escrow Payment
                                    </p>
                                </div>
                            )}

                            {order.payment_status?.toUpperCase() === 'PAID' && order.status.toUpperCase() !== 'DELIVERED' && order.status.toUpperCase() !== 'CANCELLED' && (
                                <div className="mt-12">
                                    <Button
                                        onClick={() => setIsConfirmOpen(true)}
                                        className="w-full rounded-2xl h-14 bg-success hover:bg-success/90 font-black uppercase italic shadow-xl shadow-success/20 animate-pulse"
                                    >
                                        Confirm Delivery
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfirmOpen(false)}
                            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4"
                        >
                            <Card className="w-full max-w-md p-10 rounded-[3rem] bg-surface shadow-2xl pointer-events-auto border-none glass overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-success to-primary" />

                                <div className="text-center mb-8">
                                    <div className="h-24 w-24 rounded-[2rem] bg-success/10 flex items-center justify-center text-success mx-auto mb-6 shadow-inner ring-1 ring-success/20">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Deliver Status</h2>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-2 max-w-[240px] mx-auto leading-relaxed">
                                        Ask the delivery person for the unique code from their app.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2 text-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary block italic">Confirmation Code</label>
                                        <input
                                            type="text"
                                            value={deliveryCode}
                                            onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                                            placeholder="ENTER CODE"
                                            className="w-full h-20 rounded-[1.5rem] bg-background border-2 border-border px-8 text-4xl font-black italic text-center tracking-[0.3em] text-primary focus:border-primary focus:outline-none transition-all shadow-xl"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setIsConfirmOpen(false)}
                                            variant="outline"
                                            className="flex-1 rounded-2xl h-14 font-black uppercase italic border-border/60"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => confirmMutation.mutate(deliveryCode)}
                                            isLoading={confirmMutation.isPending}
                                            disabled={!deliveryCode || deliveryCode.length < 4}
                                            className="flex-[1.5] rounded-2xl h-14 bg-success hover:bg-success/90 font-black uppercase italic shadow-lg shadow-success/20"
                                        >
                                            Verify & Close
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-warning/10 border border-warning/20">
                                        <AlertCircle size={18} className="text-warning shrink-0" />
                                        <p className="text-[9px] font-bold text-warning-dark leading-tight uppercase italic">
                                            Verify products BEFORE providing code. <br />This action is irreversible.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

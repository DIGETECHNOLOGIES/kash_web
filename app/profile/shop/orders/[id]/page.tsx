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
    CheckCircle2,
    Truck,
    Clock,
    MessageSquare,
    AlertCircle,
    User,
    Check,
    XCircle,
    Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ShopOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [complaintReason, setComplaintReason] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['seller-order', id],
        queryFn: () => orderApi.getOrderById(id as string),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: any) => orderApi.updateOrderStatus(id as string, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            setIsStatusModalOpen(false);
            toast.success('Order status updated successfully');
        },
        onError: () => {
            toast.error('Failed to update order status');
        }
    });

    const submitComplaintMutation = useMutation({
        mutationFn: (reason: string) => orderApi.complain(id as string, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            setIsComplaintModalOpen(false);
            setComplaintReason('');
            toast.success('Issue reported successfully');
        },
        onError: () => {
            toast.error('Failed to report issue');
        }
    });

    const reportNotDeliveredMutation = useMutation({
        mutationFn: () => orderApi.reportNotDelivered(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            toast.success('Non-confirmation reported successfully');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to report non-confirmation');
        }
    });

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return Clock;
            case 'PROCESSING': return Package;
            case 'SHIPPED': return Truck;
            case 'DELIVERED': return CheckCircle2;
            case 'CANCELLED': return XCircle;
            default: return Package;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'primary';
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto animate-pulse pb-20">
                    <div className="h-8 w-48 bg-surface rounded-xl mb-12" />
                    <div className="h-64 bg-surface rounded-[4rem] mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-[500px] bg-surface rounded-[3rem]" />
                        <div className="h-[400px] bg-surface rounded-[3rem]" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="text-center py-32">
                    <AlertCircle className="mx-auto mb-6 text-error opacity-20" size={80} />
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Order not found</h1>
                    <p className="text-text-secondary font-bold italic uppercase text-xs tracking-widest mt-2">The order you are looking for might have been removed or is unavailable.</p>
                    <Button onClick={() => router.push('/profile/shop/orders')} variant="ghost" className="mt-8 rounded-2xl h-14 px-8 font-black uppercase italic border border-border/50">
                        Back to Shop Orders
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const StatusIcon = getStatusIcon(order.status);

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto pb-20 px-4">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.push('/profile/shop/orders')}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] italic text-text-secondary hover:text-primary transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> {t('common.back')} to Orders
                    </button>

                    <div className="flex items-center gap-4">
                        <Badge variant={getStatusColor(order.status)} className="px-6 py-2 rounded-full uppercase italic font-black text-[10px] shadow-lg shadow-black/5 ring-4 ring-surface">
                            <StatusIcon size={14} className="mr-2" />
                            {order.status}
                        </Badge>
                    </div>
                </div>

                {/* Hero Header Card */}
                <section className="mb-10 p-10 md:p-14 rounded-[4rem] bg-surface border border-border/50 relative overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-x-1/4 -translate-y-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Sale Request</span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 italic">
                                    <Calendar size={12} /> {format(new Date(order.createdAt), 'MMM dd, yyyy • HH:mm')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">
                                Order <span className="text-primary underline decoration-primary/20">#{order.order_code || order.id}</span>
                            </h1>
                            <p className="text-text-secondary font-black italic uppercase text-[10px] tracking-widest">{order.is_invoice ? 'Generated via Digital Invoice' : 'Marketplace Purchase'}</p>
                        </div>

                        <div className="shrink-0 flex flex-col items-center md:items-end gap-3">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] bg-background border-4 border-surface shadow-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500 overflow-hidden ring-1 ring-border">
                                {order.product_image ? (
                                    <img src={formatImageUrl(order.product_image)} alt={order.product_name} className="h-full w-full object-cover" />
                                ) : (
                                    <Package size={64} className="opacity-20" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Order Details Card */}
                        <Card className="p-10 rounded-[4rem] border-none shadow-xl bg-surface/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black italic uppercase italic tracking-tighter flex items-center gap-4">
                                    <Package size={32} className="text-secondary" />
                                    Transaction Details
                                </h2>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-text-secondary italic mb-1 opacity-50">Earnings</p>
                                    <p className="text-3xl font-black italic text-secondary">{formatCurrency(Number(order.shopAmount || order.total || 0))}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-8 p-6 rounded-[2.5rem] bg-background border border-border/40 group hover:border-primary/30 transition-colors">
                                    <div className="h-24 w-24 rounded-3xl bg-surface overflow-hidden border border-border/50 shrink-0 shadow-lg">
                                        <img src={formatImageUrl(order.product_image)} alt={order.product_name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-2xl truncate uppercase tracking-tight italic text-text group-hover:text-primary transition-colors">{order.product_name}</h4>
                                        <div className="flex flex-wrap items-center gap-6 mt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-text-secondary italic">Quantity</span>
                                                <span className="text-sm font-black italic uppercase">{order.quantity} Items</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-text-secondary italic">Price per unit</span>
                                                <span className="text-sm font-black italic uppercase">{formatCurrency(Number(order.total || 0) / (order.quantity || 1))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-border/40">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 italic underline decoration-primary/30">Buyer Information</h5>
                                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-background/50 border border-border/20">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black italic uppercase tracking-tight">{order.buyer}</p>
                                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest italic mt-1">ID: {order.buyerId}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 italic underline decoration-primary/30">Delivery Address</h5>
                                            <div className="flex items-start gap-4 p-5 rounded-3xl bg-background/50 border border-border/20">
                                                <div className="h-12 w-12 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase leading-relaxed text-text">
                                                        {order.deliveryLocation || 'Standard Pickup/Delivery'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-8 rounded-[3rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                                            <div className="absolute -top-4 -right-4 text-primary/10">
                                                <CreditCard size={100} />
                                            </div>
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 italic">Payment Summary</h5>
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase italic">
                                                    <span>Subtotal</span>
                                                    <span>{formatCurrency(Number(order.totalAmount || order.total || 0))}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-primary/20">
                                                    <span className="text-xs font-black italic uppercase text-primary">Status</span>
                                                    <span className={cn("text-lg font-black italic uppercase tracking-tighter", order.payment_status === 'PAID' ? "text-success" : "text-error animate-pulse")}>
                                                        {order.payment_status || 'UNPAID'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[3rem] bg-secondary/5 border border-secondary/10 relative overflow-hidden text-center">
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 italic">Confirmation Code</h5>
                                            <p className="text-4xl font-black italic tracking-[0.2em] text-secondary">{order.delivery_code || '----'}</p>
                                            <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-2 italic opacity-60">To be verified at handover</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-10">
                        {/* Actions Card */}
                        <Card className="p-10 rounded-[4rem] border-none shadow-xl bg-secondary text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-8 italic">Management Controls</h3>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => router.push(`/messages?recipientId=${order.buyerId}&type=user&orderId=${order.id}&sendAsShopId=${order.shopId}&role=SHOP`)}
                                    className="w-full h-16 rounded-2xl bg-white text-secondary hover:bg-white/90 font-black uppercase italic tracking-widest shadow-2xl shadow-black/10 transition-all border-none"
                                >
                                    <MessageSquare size={20} className="mr-3" /> Message Buyer
                                </Button>

                                {order.status === 'PENDING' && (
                                    <Button
                                        onClick={() => updateStatusMutation.mutate('PROCESSING')}
                                        isLoading={updateStatusMutation.isPending}
                                        className="w-full h-16 rounded-2xl bg-success hover:bg-success/90 font-black uppercase italic tracking-widest shadow-2xl shadow-success/20 border-none"
                                    >
                                        Accept Order <Check size={20} className="ml-2" />
                                    </Button>
                                )}

                                {order.status === 'PROCESSING' && (
                                    <Button
                                        onClick={() => updateStatusMutation.mutate('SHIPPED')}
                                        isLoading={updateStatusMutation.isPending}
                                        className="w-full h-16 rounded-2xl bg-info hover:bg-info/90 font-black uppercase italic tracking-widest shadow-2xl shadow-info/20 border-none"
                                    >
                                        Mark Shipped <Truck size={20} className="ml-2" />
                                    </Button>
                                )}

                                {order.status === 'SHIPPED' && (
                                    <div className="p-6 rounded-3xl bg-white/10 border border-white/20 text-center">
                                        <p className="text-[10px] font-black uppercase italic text-white/60 mb-2">Awaiting Buyer Confirmation</p>
                                        <p className="text-xs font-bold italic leading-relaxed">Please ask the buyer to provide the confirmation code after inspection.</p>
                                    </div>
                                )}

                                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsStatusModalOpen(true)}
                                        className="w-full h-16 rounded-2xl border-white/20 hover:border-white/40 text-white font-black uppercase italic tracking-widest"
                                    >
                                        Change Status
                                    </Button>
                                )}
                            </div>
                        </Card>

                        {/* Customer Support Card */}
                        <Card className="p-10 rounded-[4rem] border-border/40 shadow-sm flex flex-col items-center text-center group">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-error/5 flex items-center justify-center text-error mb-6 shadow-inner ring-1 ring-error/10 group-hover:bg-error/10 transition-colors">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-error mb-2 italic">Support Issue</h3>
                            <h4 className="text-xl font-black italic uppercase tracking-tight mb-6">Found an issue with this sale?</h4>

                            {order.is_complained ? (
                                <div className="w-full p-4 rounded-2xl bg-error/5 border border-error/20 text-error">
                                    <p className="text-[10px] font-black uppercase italic mb-1">Complaint Filed</p>
                                    <p className="text-xs font-medium italic">{order.complaint_reason || 'Reported Issue'}</p>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    {order.status === 'SHIPPED' && (
                                        <Button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to report that this product has not been confirmed delivered?')) {
                                                    reportNotDeliveredMutation.mutate();
                                                }
                                            }}
                                            isLoading={reportNotDeliveredMutation.isPending}
                                            className="w-full rounded-2xl h-14 font-black uppercase italic bg-primary hover:bg-primary/90 text-white border-none shadow-xl shadow-primary/20"
                                        >
                                            Report Non-Confirmation
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsComplaintModalOpen(true)}
                                        className="w-full rounded-2xl h-14 font-black uppercase italic border-error/20 text-error hover:bg-error/5"
                                    >
                                        Report Other Issue
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Status Change Modal */}
            <AnimatePresence>
                {isStatusModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsStatusModalOpen(false)}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        >
                            <Card className="w-full max-w-lg p-12 rounded-[4rem] bg-surface relative overflow-hidden border-none shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-center">Update Status</h2>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-10 text-center italic">Select the new state for this transaction</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatusMutation.mutate(status)}
                                            disabled={updateStatusMutation.isPending}
                                            className={cn(
                                                "h-20 rounded-3xl border-2 transition-all font-black uppercase italic tracking-widest text-[10px] flex flex-col items-center justify-center gap-2",
                                                order.status === status
                                                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20"
                                                    : "border-border hover:border-primary/50 text-text-secondary hover:text-primary"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="w-full mt-8 rounded-2xl h-14 font-black uppercase italic text-text-secondary"
                                >
                                    Cancel
                                </Button>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Complaint Modal */}
            <AnimatePresence>
                {isComplaintModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsComplaintModalOpen(false)}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        >
                            <Card className="w-full max-w-lg p-12 rounded-[4rem] bg-surface relative overflow-hidden border-none shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-2 bg-error" />

                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-center text-error">Report Issue</h2>
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-10 text-center italic leading-relaxed">
                                    Describe the problem you are facing with this buyer or the delivery process.
                                </p>

                                <div className="space-y-6">
                                    <textarea
                                        value={complaintReason}
                                        onChange={(e) => setComplaintReason(e.target.value)}
                                        placeholder="EX: BUYER IS NOT CONFIRMING DELIVERY AFTER RECEIPT..."
                                        className="w-full h-40 rounded-3xl bg-background border-2 border-border p-6 text-sm font-bold italic focus:border-error focus:outline-none transition-all placeholder:opacity-30"
                                    />

                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsComplaintModalOpen(false)}
                                            className="flex-1 rounded-2xl h-16 font-black uppercase italic border-border/60"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => submitComplaintMutation.mutate(complaintReason)}
                                            isLoading={submitComplaintMutation.isPending}
                                            disabled={!complaintReason.trim()}
                                            className="flex-[2] rounded-2xl h-16 bg-error hover:bg-error/90 text-white font-black uppercase italic shadow-xl shadow-error/20 border-none"
                                        >
                                            Submit Report
                                        </Button>
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

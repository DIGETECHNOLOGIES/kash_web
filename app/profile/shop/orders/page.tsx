'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderApi } from '@/services/api/orderApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    ShoppingBag,
    ChevronRight,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    MapPin,
    ExternalLink,
    MessageSquare,
    Check,
    Store,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ShopOrdersPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delivered'>('all');

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => orderApi.getSellerOrders(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number, status: any }) =>
            orderApi.updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            toast.success('Order status updated successfully');
        },
        onError: () => {
            toast.error('Failed to update order status');
        }
    });

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return Clock;
            case 'PROCESSING': return Package;
            case 'SHIPPED': return Truck;
            case 'DELIVERED': return CheckCircle2;
            case 'CANCELLED': return XCircle;
            default: return Package;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'primary';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'primary';
        }
    };

    const orders = ordersData?.results || [];
    const filteredOrders = orders.filter(o => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status.toUpperCase());
        if (activeTab === 'delivered') return o.status.toUpperCase() === 'DELIVERED';
        return true;
    });

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto pb-20">
                <button
                    onClick={() => router.back()}
                    className="mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors italic"
                >
                    <ChevronLeft size={20} /> {t('common.back')}
                </button>

                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4 mb-2">
                            <Store size={40} className="text-secondary" />
                            Shop <span className="text-primary underline decoration-primary/30">Orders</span>
                        </h1>
                        <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic">Manage your marketplace sales</p>
                    </div>

                    <div className="flex p-1.5 rounded-2xl bg-surface border border-border shadow-inner">
                        {[
                            { id: 'all', label: 'All Sales' },
                            { id: 'pending', label: 'Active' },
                            { id: 'delivered', label: 'Completed' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                                    activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-background"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-[3rem] bg-surface border border-border" />)}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-32 text-center bg-surface/50 rounded-[4rem] border border-dashed border-border shadow-inner">
                        <ShoppingBag className="mx-auto mb-6 text-text-secondary opacity-30" size={64} />
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No sales yet</h2>
                        <p className="text-text-secondary font-bold italic uppercase text-xs tracking-widest">Your shop hasn&apos;t received any orders for this category yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredOrders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="p-0 overflow-hidden rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 group relative">
                                        <div className="absolute top-0 right-0 h-full w-2 bg-primary/20" />
                                        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start">
                                            {/* Product Preview */}
                                            <div className="h-28 w-28 md:h-36 md:w-36 rounded-[2.5rem] bg-background overflow-hidden shrink-0 border border-border shadow-inner ring-4 ring-surface">
                                                {order.product_image ? (
                                                    <img src={formatImageUrl(order.product_image)} alt={order.product_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-primary/30 bg-primary/5">
                                                        <Package size={48} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-6">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic underline decoration-primary/30">
                                                                #{order.order_code || order.id}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest italic">• {format(new Date(order.createdAt), 'MMM dd, h:mm a')}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tight">{order.product_name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="h-6 w-6 rounded-lg bg-surface flex items-center justify-center border border-border">
                                                                <User size={12} className="text-text-secondary" />
                                                            </div>
                                                            <p className="text-xs font-bold text-text-secondary uppercase italic">
                                                                Customer: <span className="text-text font-black">{order.buyer}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge variant={getStatusColor(order.status)} className="flex items-center gap-2 px-5 py-2 rounded-full uppercase italic font-black text-[10px] shadow-lg shadow-black/5 ring-1 ring-white/10">
                                                            <StatusIcon size={14} />
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="bg-background/40 rounded-3xl p-6 border border-border/20 flex flex-col md:flex-row justify-between gap-6">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1 opacity-50 italic">Confirmation Code (For Customer)</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl font-black tracking-[0.2em] text-primary italic">{order.delivery_code || '---'}</span>
                                                            <Badge variant="outline" className="text-[8px] font-black italic uppercase opacity-60">System Generated</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="md:text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1 opacity-50 italic">Payment Status</span>
                                                        <div className="flex items-center md:justify-end gap-2">
                                                            <div className={cn("h-2 w-2 rounded-full", order.payment_status === 'PAID' ? "bg-success" : "bg-error animate-pulse")} />
                                                            <span className={cn("text-xs font-black italic uppercase tracking-tighter", order.payment_status === 'PAID' ? "text-success" : "text-error")}>
                                                                {order.payment_status || 'UNPAID'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-2">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-2 opacity-50">Earnings</span>
                                                        <span className="text-xl font-black italic text-secondary">{formatCurrency(Number(order.shopAmount || order.total || 0))}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-2 opacity-50">Quantity</span>
                                                        <span className="text-lg font-black italic uppercase">{order.quantity} Items</span>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-2 opacity-50">Destination</span>
                                                        <span className="text-sm font-bold uppercase tracking-tight flex items-center gap-1.5 truncate italic"><MapPin size={14} className="text-primary" /> {order.deliveryLocation || 'Standard Delivery'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-3 w-full sm:w-auto mt-6 sm:mt-0 pt-8 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
                                                {/* {order.status === 'PENDING' && (
                                                    <Button
                                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'PROCESSING' })}
                                                        isLoading={updateStatusMutation.isPending}
                                                        className="w-full sm:w-auto rounded-2xl h-14 font-black uppercase tracking-tight italic bg-info hover:bg-info/90 text-[10px]"
                                                    >
                                                        Accept <Check size={18} className="ml-1" />
                                                    </Button>
                                                )}
                                                {order.status === 'PROCESSING' && (
                                                    <Button
                                                        onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'SHIPPED' })}
                                                        isLoading={updateStatusMutation.isPending}
                                                        className="w-full sm:w-auto rounded-2xl h-14 font-black uppercase tracking-tight italic bg-primary text-[10px]"
                                                    >
                                                        Mark Shipped <Truck size={18} className="ml-1" />
                                                    </Button>
                                                )} */}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push(`/profile/orders/${order.id}`)}
                                                    className="w-full sm:w-auto rounded-2xl h-14 font-black uppercase tracking-tight italic border-border/60 hover:border-primary/50 text-[10px]"
                                                >
                                                    Details <ChevronRight size={18} className="ml-1" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => router.push(`/messages?recipientId=${order.buyerId}&type=user&orderId=${order.id}&sendAsShopId=${order.shopId}&role=SHOP`)}
                                                    className="self-start sm:self-auto rounded-2xl h-14 w-14 p-0 bg-primary/5 text-primary hover:bg-primary/10 transition-all shadow-inner"
                                                >
                                                    <MessageSquare size={22} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

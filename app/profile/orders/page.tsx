'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { formatImageUrl, formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delivered'>('all');

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderApi.listOrders(),
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
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
                <ChevronLeft size={20} /> {t('common.back')}
            </button>

            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                        <ShoppingBag size={40} className="text-primary" />
                        My <span className="text-primary underline decoration-primary/30">Orders</span>
                    </h1>

                    <div className="flex p-1.5 rounded-2xl bg-surface border border-border shadow-sm">
                        {[
                            { id: 'all', label: 'All Orders' },
                            { id: 'pending', label: 'Active' },
                            { id: 'delivered', label: 'Delivered' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id ? "bg-secondary text-white shadow-lg" : "text-text-secondary hover:bg-background"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[2.5rem] bg-surface border border-border" />)}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-24 text-center bg-surface/50 rounded-[3rem] border border-dashed border-border">
                        <ShoppingBag className="mx-auto mb-6 text-text-secondary opacity-30" size={64} />
                        <h2 className="text-2xl font-black italic uppercase italic tracking-tighter mb-2">No orders match</h2>
                        <p className="text-text-secondary font-medium italic">Looks like you haven&apos;t placed any orders in this category yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="p-0 overflow-hidden rounded-[2.5rem] border-border/40 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                                            {/* Product Preview */}
                                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-background overflow-hidden shrink-0 border border-border/50">
                                                {order.product_image ? (
                                                    <img src={formatImageUrl(order.product_image)} alt={order.shopName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-primary/30 bg-primary/5">
                                                        <Package size={40} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 block italic underline decoration-primary/30">
                                                            Order #{order.order_code || order.id}
                                                        </span>
                                                        <h3 className="text-xl font-black italic uppercase tracking-tight">{order.product_name || `Order from ${order.shopName}`}</h3>
                                                    </div>
                                                    <Badge variant={getStatusColor(order.status)} className="w-fit flex items-center gap-1.5 px-4 py-1.5 rounded-full uppercase italic font-black shadow-lg shadow-black/5">
                                                        <StatusIcon size={14} />
                                                        {order.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1">Total Amount</span>
                                                        <span className="text-lg font-black italic text-primary">{formatCurrency(Number(order.totalAmount || order.total || 0))}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1">Order Date</span>
                                                        <span className="text-sm font-bold uppercase tracking-tight">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1">Destination</span>
                                                        <span className="text-sm font-bold uppercase tracking-tight flex items-center gap-1 truncate"><MapPin size={12} className="text-primary" /> {order.deliveryLocation || 'Cameroon'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-border/40">
                                                <Button
                                                    onClick={() => router.push(`/profile/orders/${order.id}`)}
                                                    className="flex-1 rounded-2xl h-12 md:h-14 font-black uppercase tracking-tight italic"
                                                >
                                                    Details <ChevronRight size={18} className="ml-1" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="rounded-2xl h-12 md:h-14 w-12 md:w-auto p-0 md:px-6 border-border/60 hover:border-primary/50 text-text-secondary hover:text-primary transition-all"
                                                >
                                                    <ExternalLink size={20} className="md:mr-2" />
                                                    <span className="hidden md:inline">Invoice</span>
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


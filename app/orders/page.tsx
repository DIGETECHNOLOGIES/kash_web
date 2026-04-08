'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { orderApi } from '@/services/api/orderApi';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Package, Truck, CheckCircle2, AlertCircle, MessageCircle, RefreshCw, ChevronRight, Store } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const { t } = useTranslation();
    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderApi.listOrders(),
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'processing': return 'primary';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            default: return 'primary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle2 size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto py-12">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">My <span className="text-primary">Orders</span></h1>
                <p className="text-text-secondary mb-12 font-medium">Track and manage your professional purchases</p>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface border border-border" />)}
                    </div>
                ) : ordersData?.results?.length === 0 ? (
                    <Card className="py-24 text-center rounded-[3rem] border-dashed opacity-50">
                        <Package size={48} className="mx-auto mb-4 text-text-secondary" />
                        <h3 className="text-xl font-bold uppercase italic tracking-tighter">No orders found</h3>
                        <p className="text-sm text-text-secondary mt-2">Start shopping to see your orders here.</p>
                        <Link href="/products">
                            <Button className="mt-8 rounded-2xl">Browse Marketplace</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {ordersData?.results?.map((order: any) => (
                            <Card key={order.id} className="p-0 overflow-hidden rounded-[2rem] border-border/60 bg-surface shadow-sm">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    {/* Order Thumbnail */}
                                    <div className="h-24 w-24 rounded-2xl bg-background border border-border overflow-hidden flex-shrink-0">
                                        <img
                                            src={order.product_image || 'https://via.placeholder.com/100'}
                                            alt={order.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Order Info */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Badge variant={getStatusColor(order.status)} className="rounded-lg h-7 gap-1.5 uppercase italic text-[10px] font-black tracking-widest px-3 border-none">
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </Badge>
                                            <span className="text-xs font-bold text-text-secondary">#{order.order_code || order.id}</span>
                                        </div>
                                        <h3 className="text-xl font-black italic tracking-tighter uppercase line-clamp-1">{order.product_name}</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                            <Store size={14} className="text-primary" />
                                            {order.shopName}
                                        </div>
                                    </div>

                                    {/* Price & Date */}
                                    <div className="text-left md:text-right flex flex-col justify-center">
                                        <p className="text-2xl font-black italic tracking-tighter text-primary">{parseFloat(order.total).toLocaleString()} <small className="text-[10px] uppercase not-italic opacity-60">FCFA</small></p>
                                        <p className="text-xs font-bold text-text-secondary italic mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="bg-background/50 border-t border-border/40 p-4 md:px-8 flex flex-wrap gap-4 items-center justify-between">
                                    <div className="flex gap-4">
                                        <Button variant="ghost" size="sm" className="h-10 text-xs font-bold gap-2 text-text-secondary hover:text-primary px-2" onClick={() => {/* Contact Logic */ }}>
                                            <MessageCircle size={14} /> Message Shop
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-10 text-xs font-bold gap-2 text-text-secondary hover:text-error px-2" onClick={() => {/* Refund Logic */ }}>
                                            <RefreshCw size={14} /> Request Refund
                                        </Button>
                                    </div>
                                    <Link href={`/orders/${order.id}`}>
                                        <Button variant="outline" size="sm" className="h-10 rounded-xl px-6 gap-2 border-border/80">
                                            View Details
                                            <ChevronRight size={14} />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
    Bell,
    ShoppingBag,
    MessageSquare,
    ShieldCheck,
    Gift,
    ChevronLeft,
    Trash2,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/services/api/notificationApi';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const queryClient = useQueryClient();

    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.listNotifications(),
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        },
    });

    const markReadMutation = useMutation({
        mutationFn: (id: number) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        },
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return ShoppingBag;
            case 'MESSAGE': return MessageSquare;
            case 'PROMO': return Gift;
            case 'SYSTEM': return ShieldCheck;
            default: return Bell;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'ORDER': return 'text-primary';
            case 'MESSAGE': return 'text-info';
            case 'PROMO': return 'text-warning';
            case 'SYSTEM': return 'text-error';
            default: return 'text-primary';
        }
    };

    const getBg = (type: string) => {
        switch (type) {
            case 'ORDER': return 'bg-primary/10';
            case 'MESSAGE': return 'bg-info/10';
            case 'PROMO': return 'bg-warning/10';
            case 'SYSTEM': return 'bg-error/10';
            default: return 'bg-primary/10';
        }
    };

    const notifications = notificationsData?.results || [];

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} /> Back
                    </button>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="text-xs font-black uppercase tracking-widest text-primary"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-2xl border-border/60"><Trash2 size={18} /></Button>
                    </div>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">My <span className="text-primary underline decoration-primary/30">{t('notifications.title')}</span></h1>
                    <p className="text-text-secondary">Stay updated with your latest orders, messages and marketplace news.</p>
                </header>

                <div className="space-y-4">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 animate-pulse rounded-[2.5rem] bg-surface border border-border" />
                        ))
                    ) : notifications.length === 0 ? (
                        <div className="py-20 text-center bg-surface rounded-[3rem] border border-dashed border-border">
                            <Bell className="mx-auto mb-4 opacity-20" size={48} />
                            <p className="text-text-secondary font-medium italic">No notifications yet</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {notifications.map((notif: any, i: number) => {
                                const Icon = getIcon(notif.type);
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                                    >
                                        <Card className={`p-6 rounded-[2.5rem] flex items-start gap-6 transition-all border-border/40 shadow-sm group hover:shadow-xl hover:border-primary/30 cursor-pointer ${!notif.is_read ? 'bg-primary/[0.02] border-primary/20' : 'bg-surface'}`}>
                                            <div className={`h-16 w-16 rounded-2xl ${getBg(notif.type)} ${getColor(notif.type)} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                                <Icon size={32} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-black italic uppercase tracking-tight text-lg ${!notif.is_read ? 'text-primary' : ''}`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.is_read && <div className="h-2 w-2 rounded-full bg-primary animate-pulse mt-2" />}
                                                </div>
                                                <p className="text-sm text-text-secondary font-medium leading-relaxed mb-3">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} /> {formatDistanceToNow(new Date(notif.created_at || new Date()), { addSuffix: true })}
                                                    </span>
                                                    <Badge variant="outline" className="text-[8px] italic font-black uppercase py-0 px-2 rounded-md">{notif.type}</Badge>
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="rounded-xl text-text-secondary hover:text-error">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Showing last 30 days of activity</p>
                </div>
            </div>
        </MainLayout>
    );
}

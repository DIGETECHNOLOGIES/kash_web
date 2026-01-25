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

export default function NotificationsPage() {
    const { t } = useTranslation();
    const router = useRouter();

    // Mock notifications
    const notifications = [
        {
            id: 1,
            type: 'ORDER',
            title: 'Order Confirmed!',
            message: 'Your order #77421 has been accepted by the merchant and is being processed.',
            time: '2 hours ago',
            read: false,
            icon: ShoppingBag,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            id: 2,
            type: 'MESSAGE',
            title: 'New Message',
            message: 'Neo Tech Store sent you a message regarding your inquiry.',
            time: '5 hours ago',
            read: false,
            icon: MessageSquare,
            color: 'text-info',
            bg: 'bg-info/10'
        },
        {
            id: 3,
            type: 'PROMO',
            title: 'Weekend Flash Sale!',
            message: 'Up to 50% off on all electronics this Sunday. Don\'t miss out!',
            time: '1 day ago',
            read: true,
            icon: Gift,
            color: 'text-warning',
            bg: 'bg-warning/10'
        },
        {
            id: 4,
            type: 'SYSTEM',
            title: 'Security Alert',
            message: 'Your account was logged in from a new device in Douala, Cameroon.',
            time: '2 days ago',
            read: true,
            icon: ShieldCheck,
            color: 'text-error',
            bg: 'bg-error/10'
        }
    ];

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
                        <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary">Mark all as read</Button>
                        <Button variant="outline" size="icon" className="rounded-2xl border-border/60"><Trash2 size={18} /></Button>
                    </div>
                </div>

                <header className="mb-12">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">My <span className="text-primary underline decoration-primary/30">{t('notifications.title')}</span></h1>
                    <p className="text-text-secondary">Stay updated with your latest orders, messages and marketplace news.</p>
                </header>

                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((notif, i) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={`p-6 rounded-[2.5rem] flex items-start gap-6 transition-all border-border/40 shadow-sm group hover:shadow-xl hover:border-primary/30 ${!notif.read ? 'bg-primary/[0.02] border-primary/20' : 'bg-surface'}`}>
                                    <div className={`h-16 w-16 rounded-2xl ${notif.bg} ${notif.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                        <notif.icon size={32} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-black italic uppercase tracking-tight text-lg ${!notif.read ? 'text-primary' : ''}`}>
                                                {notif.title}
                                            </h4>
                                            {!notif.read && <div className="h-2 w-2 rounded-full bg-primary animate-pulse mt-2" />}
                                        </div>
                                        <p className="text-sm text-text-secondary font-medium leading-relaxed mb-3">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} /> {notif.time}
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
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Showing last 30 days of activity</p>
                </div>
            </div>
        </MainLayout>
    );
}
